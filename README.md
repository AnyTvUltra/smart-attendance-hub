# Smart Attendance Hub

**I see** نظام  يسجّل حضور الطلاب وغيابهم بالتعرف على الوجوه. تُركَّب كاميرا USB عند باب المدرسة، فإذا مرّ أمامها طالب مسجّل في النظام يتعرف عليه البرنامج ويسجّل حضوره تلقائياً بحالة **حاضر** أو **متأخر**، ويحسب دقائق التأخير من وقت بدء الدوام. الطالب الذي لا يظهر في اليوم يُحسب **غائباً**، ويمكن للمعلم أن يعدّل الحالة يدوياً، مثلاً إلى **معذور**. أما الوجوه غير المسجلة فيتجاهلها النظام تماماً ولا يحفظ عنها أي شيء.

يتيح البرنامج سجلاً يومياً وشهرياً وسنوياً كاملاً لكل طالب، ويرتّب الطلاب حسب الصف والشعبة. فيه أيضاً ملاحظات وأعذار، وتقارير يمكن تصديرها إلى Excel أو طباعتها، وصلاحيات مختلفة للمدير والمعلم والمشاهد، ونسخ احتياطي واستعادة للبيانات.

البرنامج مبني بلغة Python، وواجهته بمكتبة PySide6. يعتمد على نموذجي YuNet وSFace من OpenCV للتعرف على الوجوه، ويحفظ بياناته في قاعدة SQLite محلية. يعمل **بدون إنترنت بالكامل** ولا يحفظ أي فيديو، وواجهته متوفرة بثلاث لغات: العربية والكردية السورانية والإنجليزية.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c282b339-7732-4be4-be1e-24d12b9ee793).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
