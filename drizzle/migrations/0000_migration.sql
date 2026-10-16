create type public.app_role as enum ('admin','teacher','viewer');
create type public.attendance_status as enum ('present','late','absent','excused');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
create table public.settings (
  id int primary key default 1 check (id = 1),
  school_name text not null default 'مدرستي',
  start_time time not null default '07:30',
  grace_minutes int not null default 10,
  match_threshold real not null default 0.5,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text,
  full_name text not null,
  grade text not null,
  section text not null,
  face_descriptor jsonb,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  status attendance_status not null,
  arrival_time timestamptz,
  late_minutes int not null default 0,
  note text,
  source text not null default 'auto',
  updated_by uuid,
  updated_at timestamptz not null default now(),
  unique (student_id, date)
);
create index attendance_date_idx on public.attendance(date);

grant select, insert, update, delete on public.profiles, public.user_roles, public.settings, public.students, public.attendance to authenticated;
grant all on public.profiles, public.user_roles, public.settings, public.students, public.attendance to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.settings enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','teacher','viewer')) $$;

-- profiles
create policy "own or admin read profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own update profile" on public.profiles for update to authenticated using (id = auth.uid());
-- roles
create policy "read own or admin roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
-- settings
create policy "staff read settings" on public.settings for select to authenticated using (public.is_staff(auth.uid()));
create policy "admin update settings" on public.settings for update to authenticated using (public.has_role(auth.uid(),'admin'));
-- students
create policy "staff read students" on public.students for select to authenticated using (public.is_staff(auth.uid()));
create policy "admin insert students" on public.students for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update students" on public.students for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete students" on public.students for delete to authenticated using (public.has_role(auth.uid(),'admin'));
-- attendance
create policy "staff read attendance" on public.attendance for select to authenticated using (public.is_staff(auth.uid()));
create policy "teacher insert attendance" on public.attendance for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'));
create policy "teacher update attendance" on public.attendance for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'teacher'));
create policy "admin delete attendance" on public.attendance for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- signup: profile + role (first user admin, others viewer)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'viewer');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();