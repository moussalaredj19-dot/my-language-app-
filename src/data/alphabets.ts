import { AlphabetLetter, LanguageAlphabet } from '../types';

const RUSSIAN_LETTERS: AlphabetLetter[] = [
  { letter: 'А а', name: 'آ', pronunciationOpposite: 'آ', pronunciationLatin: 'a', soundHint: 'صوت مفتوح مثل الألف في "دار"', exampleWord: 'Арбуз', examplePronunciation: 'أربوز', exampleMeaning: 'بطيخ' },
  { letter: 'Б б', name: 'بي', pronunciationOpposite: 'ب', pronunciationLatin: 'b', soundHint: 'مثل الباء العربية تماماً', exampleWord: 'Брат', examplePronunciation: 'برات', exampleMeaning: 'أخ' },
  { letter: 'В в', name: 'في', pronunciationOpposite: 'ف', pronunciationLatin: 'v', soundHint: 'ينطق مثل V الإنجليزية (شفة سفلى مع الأسنان)', exampleWord: 'Вода', examplePronunciation: 'فادا', exampleMeaning: 'ماء' },
  { letter: 'Г г', name: 'غي', pronunciationOpposite: 'غ / ج مصرية', pronunciationLatin: 'g', soundHint: 'مثل الجيم القاهرية أو G في Go', exampleWord: 'Город', examplePronunciation: 'غورود', exampleMeaning: 'مدينة' },
  { letter: 'Д д', name: 'دي', pronunciationOpposite: 'د', pronunciationLatin: 'd', soundHint: 'مثل الدال العربية الواضحة', exampleWord: 'Дом', examplePronunciation: 'دوم', exampleMeaning: 'منزل' },
  { letter: 'Е е', name: 'ييه', pronunciationOpposite: 'ييه', pronunciationLatin: 'ye', soundHint: 'مثل "ييه" في بداية الكلمة', exampleWord: 'Еда', examplePronunciation: 'ييدا', exampleMeaning: 'طعام' },
  { letter: 'Ё ё', name: 'يو', pronunciationOpposite: 'يو', pronunciationLatin: 'yo', soundHint: 'دائماً منبورة وتنطق "يو"', exampleWord: 'Ёлка', examplePronunciation: 'يولكا', exampleMeaning: 'شجرة تنوب' },
  { letter: 'Ж ж', name: 'ژي', pronunciationOpposite: 'ژ', pronunciationLatin: 'zh', soundHint: 'مثل الجيم الشامية الخفيفة أو S في Treasure', exampleWord: 'Жизнь', examplePronunciation: 'ژيزن', exampleMeaning: 'حياة' },
  { letter: 'З з', name: 'زي', pronunciationOpposite: 'ز', pronunciationLatin: 'z', soundHint: 'مثل حرف الزاي العربية تماماً', exampleWord: 'Зима', examplePronunciation: 'زيما', exampleMeaning: 'شتاء' },
  { letter: 'И и', name: 'إي', pronunciationOpposite: 'إي', pronunciationLatin: 'i', soundHint: 'كسرة ممدودة مثل "إي" في "في"', exampleWord: 'Имя', examplePronunciation: 'إيميا', exampleMeaning: 'اسم' },
  { letter: 'Й й', name: 'يْ قصيرة', pronunciationOpposite: 'يْ', pronunciationLatin: 'y', soundHint: 'ياء ساكنة سريعة مثل نهاية كلمة "ماي"', exampleWord: 'Чай', examplePronunciation: 'تشاي', exampleMeaning: 'شاي' },
  { letter: 'К к', name: 'كا', pronunciationOpposite: 'ك', pronunciationLatin: 'k', soundHint: 'مثل الكاف العربية الخالصة', exampleWord: 'Книга', examplePronunciation: 'كنيغا', exampleMeaning: 'كتاب' },
  { letter: 'Л л', name: 'إل', pronunciationOpposite: 'ل', pronunciationLatin: 'l', soundHint: 'مثل اللام العربية', exampleWord: 'Лето', examplePronunciation: 'ليتو', exampleMeaning: 'صيف' },
  { letter: 'М м', name: 'إم', pronunciationOpposite: 'م', pronunciationLatin: 'm', soundHint: 'مثل الميم العربية تماماً', exampleWord: 'Мама', examplePronunciation: 'ماما', exampleMeaning: 'أم' },
  { letter: 'Н н', name: 'إن', pronunciationOpposite: 'ن', pronunciationLatin: 'n', soundHint: 'مثل النون العربية (تشبه H بالإنجليزية شكلًا فقط)', exampleWord: 'Ночь', examplePronunciation: 'نوتش', exampleMeaning: 'ليل' },
  { letter: 'О о', name: 'أو', pronunciationOpposite: 'أو', pronunciationLatin: 'o', soundHint: 'أو واضحة عند النبر، وتخفف لـ "أ" إذا لم تُنبر', exampleWord: 'Окно', examplePronunciation: 'أكنو', exampleMeaning: 'نافذة' },
  { letter: 'П п', name: 'پي', pronunciationOpposite: 'ب / پ', pronunciationLatin: 'p', soundHint: 'باء مهموسة مثل P في Pen', exampleWord: 'Привет', examplePronunciation: 'بريفييت', exampleMeaning: 'مرحباً' },
  { letter: 'Р р', name: 'إر', pronunciationOpposite: 'ر', pronunciationLatin: 'r', soundHint: 'راء مكررة واضحة مثل الراء العربية (تُشبه P بالإنجليزية شكلاً)', exampleWord: 'Рука', examplePronunciation: 'روكا', exampleMeaning: 'يد' },
  { letter: 'С с', name: 'إس', pronunciationOpposite: 'س', pronunciationLatin: 's', soundHint: 'دائماً سين صافية (تُشبه C بالإنجليزية شكلاً)', exampleWord: 'Спасибо', examplePronunciation: 'سباسيبو', exampleMeaning: 'شكراً' },
  { letter: 'Т т', name: 'تي', pronunciationOpposite: 'ت', pronunciationLatin: 't', soundHint: 'مثل التاء العربية المرققة', exampleWord: 'Утро', examplePronunciation: 'أوترو', exampleMeaning: 'صباح' },
  { letter: 'У у', name: 'أو مدودة', pronunciationOpposite: 'أوُ', pronunciationLatin: 'u', soundHint: 'ضمة ممدودة مثل "وو" في "نور"', exampleWord: 'Урок', examplePronunciation: 'أوروك', exampleMeaning: 'درس' },
  { letter: 'Ф ф', name: 'إف', pronunciationOpposite: 'ف', pronunciationLatin: 'f', soundHint: 'مثل الفاء العربية تماماً', exampleWord: 'Фото', examplePronunciation: 'فوتو', exampleMeaning: 'صورة' },
  { letter: 'Х х', name: 'خا', pronunciationOpposite: 'خ', pronunciationLatin: 'kh', soundHint: 'مثل الخاء العربية تماماً (تُشبه X بالإنجليزية شكلاً)', exampleWord: 'Хорошо', examplePronunciation: 'خاراشو', exampleMeaning: 'جيد / حسناً' },
  { letter: 'Ц ц', name: 'تسي', pronunciationOpposite: 'تس', pronunciationLatin: 'ts', soundHint: 'تاء + سين سريعة معاً', exampleWord: 'Цветок', examplePronunciation: 'تسفيتوك', exampleMeaning: 'زهرة' },
  { letter: 'Ч ч', name: 'تشي', pronunciationOpposite: 'تش', pronunciationLatin: 'ch', soundHint: 'مثل Ch في Chair', exampleWord: 'Час', examplePronunciation: 'تشاس', exampleMeaning: 'ساعة' },
  { letter: 'Ш ш', name: 'شا', pronunciationOpposite: 'ش', pronunciationLatin: 'sh', soundHint: 'شين مفخمة قليلاً', exampleWord: 'Школа', examplePronunciation: 'شكولا', exampleMeaning: 'مدرسة' },
  { letter: 'Щ щ', name: 'شتشا', pronunciationOpposite: 'شتش', pronunciationLatin: 'shch', soundHint: 'شين مرققة وممدودة مثل "شتش"', exampleWord: 'Щётка', examplePronunciation: 'شتشوتكا', exampleMeaning: 'فرشاة' },
  { letter: 'Ъ ъ', name: 'علامة التفخيم', pronunciationOpposite: 'تفخيم', pronunciationLatin: '(hard)', soundHint: 'علامة صامتة تفصل وتفخم الحرف قبلها', exampleWord: 'Объект', examplePronunciation: 'أبييكت', exampleMeaning: 'كائن / هدف' },
  { letter: 'Ы ы', name: 'إي عميقة', pronunciationOpposite: 'إي عميقة', pronunciationLatin: 'y', soundHint: 'صوت بين الكسرة والضمة من عمق الفم', exampleWord: 'Сыр', examplePronunciation: 'سير', exampleMeaning: 'جبن' },
  { letter: 'Ь ь', name: 'علامة الترقيق', pronunciationOpposite: 'ترقيق', pronunciationLatin: '(soft)', soundHint: 'علامة صامتة ترقّق الحرف الذي يسبقها', exampleWord: 'Мать', examplePronunciation: 'ماتْ', exampleMeaning: 'أم' },
  { letter: 'Э э', name: 'إيه', pronunciationOpposite: 'إيه', pronunciationLatin: 'e', soundHint: 'فتحة مائلة للكسرة مثل E في End', exampleWord: 'Это', examplePronunciation: 'إيتو', exampleMeaning: 'هذا' },
  { letter: 'Ю ю', name: 'يو', pronunciationOpposite: 'يو', pronunciationLatin: 'yu', soundHint: 'مثل كلمة You بالإنجليزية', exampleWord: 'Юг', examplePronunciation: 'يوغ', exampleMeaning: 'جنوب' },
  { letter: 'Я я', name: 'يا', pronunciationOpposite: 'يا', pronunciationLatin: 'ya', soundHint: 'تعني أيضاً "أنا" بالروسية، وتنطق "يا"', exampleWord: 'Яблоко', examplePronunciation: 'يابلوكو', exampleMeaning: 'تفاحة' },
];

const ENGLISH_LETTERS: AlphabetLetter[] = [
  { letter: 'A a', name: 'إي', pronunciationOpposite: 'آ / إيه', pronunciationLatin: 'a', soundHint: 'يُنطق قصيراً مثل Cat أو ممدوداً مثل Name', exampleWord: 'Apple', examplePronunciation: 'آبل', exampleMeaning: 'تفاحة' },
  { letter: 'B b', name: 'بي', pronunciationOpposite: 'ب', pronunciationLatin: 'b', soundHint: 'مثل الباء العربية الواضحة', exampleWord: 'Book', examplePronunciation: 'بوك', exampleMeaning: 'كتاب' },
  { letter: 'C c', name: 'سي', pronunciationOpposite: 'ك / س', pronunciationLatin: 'c', soundHint: 'س قبل e/i/y وكاف في الباقي', exampleWord: 'Cat', examplePronunciation: 'كات', exampleMeaning: 'قطة' },
  { letter: 'D d', name: 'دي', pronunciationOpposite: 'د', pronunciationLatin: 'd', soundHint: 'مثل الدال العربية', exampleWord: 'Day', examplePronunciation: 'داي', exampleMeaning: 'يوم' },
  { letter: 'E e', name: 'إي', pronunciationOpposite: 'إي / إيه', pronunciationLatin: 'e', soundHint: 'كسرة خفيفة مثل Bed أو ممدودة في See', exampleWord: 'Egg', examplePronunciation: 'إيغ', exampleMeaning: 'بيضة' },
  { letter: 'F f', name: 'إف', pronunciationOpposite: 'ف', pronunciationLatin: 'f', soundHint: 'مثل الفاء العربية', exampleWord: 'Friend', examplePronunciation: 'فريند', exampleMeaning: 'صديق' },
  { letter: 'G g', name: 'جي', pronunciationOpposite: 'غ / ج', pronunciationLatin: 'g', soundHint: 'جيم مصرية في Go وأحياناً جيم معطشة في Page', exampleWord: 'Good', examplePronunciation: 'غود', exampleMeaning: 'جيد' },
  { letter: 'H h', name: 'إتش', pronunciationOpposite: 'هـ', pronunciationLatin: 'h', soundHint: 'مثل الهاء العربية الخفيفة', exampleWord: 'Hello', examplePronunciation: 'هيلو', exampleMeaning: 'مرحباً' },
  { letter: 'I i', name: 'آي', pronunciationOpposite: 'إي / آي', pronunciationLatin: 'i', soundHint: 'كسرة سريعة في Sit أو آي في Time', exampleWord: 'Idea', examplePronunciation: 'آيديا', exampleMeaning: 'فكرة' },
  { letter: 'J j', name: 'جاي', pronunciationOpposite: 'ج', pronunciationLatin: 'j', soundHint: 'جيم معطشة واضحة', exampleWord: 'Job', examplePronunciation: 'جوب', exampleMeaning: 'وظيفة' },
  { letter: 'K k', name: 'كي', pronunciationOpposite: 'ك', pronunciationLatin: 'k', soundHint: 'مثل الكاف العربية', exampleWord: 'Key', examplePronunciation: 'كي', exampleMeaning: 'مفتاح' },
  { letter: 'L l', name: 'إل', pronunciationOpposite: 'ل', pronunciationLatin: 'l', soundHint: 'مثل اللام العربية', exampleWord: 'Learn', examplePronunciation: 'ليرن', exampleMeaning: 'يتعلم' },
  { letter: 'M m', name: 'إم', pronunciationOpposite: 'م', pronunciationLatin: 'm', soundHint: 'مثل الميم العربية', exampleWord: 'Morning', examplePronunciation: 'مورنينغ', exampleMeaning: 'صباح' },
  { letter: 'N n', name: 'إن', pronunciationOpposite: 'ن', pronunciationLatin: 'n', soundHint: 'مثل النون العربية', exampleWord: 'Name', examplePronunciation: 'نيم', exampleMeaning: 'اسم' },
  { letter: 'O o', name: 'أو', pronunciationOpposite: 'أو', pronunciationLatin: 'o', soundHint: 'ضمة مفتوحة مثل Hot أو أو في Go', exampleWord: 'Open', examplePronunciation: 'أوبن', exampleMeaning: 'يفتح' },
  { letter: 'P p', name: 'پي', pronunciationOpposite: 'پ / ب', pronunciationLatin: 'p', soundHint: 'باء مهموسة بهواء خفيف', exampleWord: 'Pen', examplePronunciation: 'پين', exampleMeaning: 'قلم' },
  { letter: 'Q q', name: 'كيو', pronunciationOpposite: 'كْو', pronunciationLatin: 'q', soundHint: 'يأتي مع u فينطق "كو"', exampleWord: 'Question', examplePronunciation: 'كويستشن', exampleMeaning: 'سؤال' },
  { letter: 'R r', name: 'آر', pronunciationOpposite: 'ر', pronunciationLatin: 'r', soundHint: 'راء مرققة مستديرة اللسان', exampleWord: 'Read', examplePronunciation: 'ريد', exampleMeaning: 'يقرأ' },
  { letter: 'S s', name: 'إس', pronunciationOpposite: 'س', pronunciationLatin: 's', soundHint: 'سين صافية في Start', exampleWord: 'Sun', examplePronunciation: 'صن', exampleMeaning: 'شمس' },
  { letter: 'T t', name: 'تي', pronunciationOpposite: 'ت', pronunciationLatin: 't', soundHint: 'تاء عربية واضحة', exampleWord: 'Time', examplePronunciation: 'تايم', exampleMeaning: 'وقت' },
  { letter: 'U u', name: 'يو', pronunciationOpposite: 'آ / يو', pronunciationLatin: 'u', soundHint: 'فتحة خفيفة في Cup أو يو في Use', exampleWord: 'Use', examplePronunciation: 'يوز', exampleMeaning: 'يستخدم' },
  { letter: 'V v', name: 'في', pronunciationOpposite: 'ف مفخمة', pronunciationLatin: 'v', soundHint: 'مثل الفاء مع اهتزاز الشفة السفلى', exampleWord: 'Voice', examplePronunciation: 'فويس', exampleMeaning: 'صوت' },
  { letter: 'W w', name: 'دبليو', pronunciationOpposite: 'و', pronunciationLatin: 'w', soundHint: 'مثل الواو العربية تماماً', exampleWord: 'Water', examplePronunciation: 'ووتر', exampleMeaning: 'ماء' },
  { letter: 'X x', name: 'إكس', pronunciationOpposite: 'كس', pronunciationLatin: 'x', soundHint: 'كاف + سين معاً', exampleWord: 'Box', examplePronunciation: 'بوكس', exampleMeaning: 'صندوق' },
  { letter: 'Y y', name: 'واي', pronunciationOpposite: 'ي', pronunciationLatin: 'y', soundHint: 'ياء واضحة في بداية الكلمة', exampleWord: 'Yes', examplePronunciation: 'يس', exampleMeaning: 'نعم' },
  { letter: 'Z z', name: 'زد / زي', pronunciationOpposite: 'ز', pronunciationLatin: 'z', soundHint: 'مثل الزاي العربية', exampleWord: 'Zero', examplePronunciation: 'زيرو', exampleMeaning: 'صفر' },
];

const FRENCH_LETTERS: AlphabetLetter[] = [
  { letter: 'A a', name: 'آ', pronunciationOpposite: 'آ', pronunciationLatin: 'a', soundHint: 'ألف مفتوحة واضحة', exampleWord: 'Ami', examplePronunciation: 'أمي', exampleMeaning: 'صديق' },
  { letter: 'B b', name: 'بيه', pronunciationOpposite: 'ب', pronunciationLatin: 'b', soundHint: 'باء عربية', exampleWord: 'Bonjour', examplePronunciation: 'بونجور', exampleMeaning: 'مرحباً' },
  { letter: 'C c', name: 'سيه', pronunciationOpposite: 'س / ك', pronunciationLatin: 'c', soundHint: 'س قبل e/i/y وكاف في غيرها', exampleWord: 'Café', examplePronunciation: 'كافيه', exampleMeaning: 'قهوة' },
  { letter: 'Ç ç', name: 'سي سيديل', pronunciationOpposite: 'س', pronunciationLatin: 's', soundHint: 'تُنطق دائماً سين صافية', exampleWord: 'Ça va', examplePronunciation: 'سا فا', exampleMeaning: 'كيف الحال' },
  { letter: 'E e', name: 'أو خفيفة', pronunciationOpposite: 'أوُ', pronunciationLatin: 'e', soundHint: 'حركة قصيرة خفيفة بين الضمة والفتحة', exampleWord: 'Merci', examplePronunciation: 'ميرسي', exampleMeaning: 'شكراً' },
  { letter: 'É é', name: 'إيه حادة', pronunciationOpposite: 'إيه', pronunciationLatin: 'é', soundHint: 'مثل إيه الممدودة بوضوح', exampleWord: 'École', examplePronunciation: 'إيكول', exampleMeaning: 'مدرسة' },
  { letter: 'È è', name: 'إيه مفتوحة', pronunciationOpposite: 'إيه مفتوحة', pronunciationLatin: 'è', soundHint: 'فتح خفيف مائل للكسرة', exampleWord: 'Frère', examplePronunciation: 'فرير', exampleMeaning: 'أخ' },
  { letter: 'J j', name: 'جي', pronunciationOpposite: 'ژ', pronunciationLatin: 'zh', soundHint: 'جيم شامية ناعمة', exampleWord: 'Jour', examplePronunciation: 'جور', exampleMeaning: 'يوم' },
  { letter: 'L l', name: 'إل', pronunciationOpposite: 'ل', pronunciationLatin: 'l', soundHint: 'لام واضحة', exampleWord: 'Livre', examplePronunciation: 'ليفر', exampleMeaning: 'كتاب' },
  { letter: 'M m', name: 'إم', pronunciationOpposite: 'م', pronunciationLatin: 'm', soundHint: 'ميم واضحة', exampleWord: 'Matin', examplePronunciation: 'ماتان', exampleMeaning: 'صباح' },
  { letter: 'N n', name: 'إن', pronunciationOpposite: 'ن', pronunciationLatin: 'n', soundHint: 'نون واضحة (وغُنّة خفيفة في نهاية المقطع)', exampleWord: 'Nuit', examplePronunciation: 'نوي', exampleMeaning: 'ليل' },
  { letter: 'O o', name: 'أو', pronunciationOpposite: 'أو', pronunciationLatin: 'o', soundHint: 'أو دائرية', exampleWord: 'Eau', examplePronunciation: 'أو', exampleMeaning: 'ماء' },
  { letter: 'R r', name: 'إير', pronunciationOpposite: 'غ / ر', pronunciationLatin: 'r', soundHint: 'غين فرنسية حلقية ناعمة', exampleWord: 'Rue', examplePronunciation: 'رو / غو', exampleMeaning: 'شارع' },
  { letter: 'S s', name: 'إس', pronunciationOpposite: 'س / ز', pronunciationLatin: 's', soundHint: 'سين في البداية، وزاي بين حرفين صوتيين', exampleWord: 'Salut', examplePronunciation: 'سالو', exampleMeaning: 'أهلاً' },
  { letter: 'U u', name: 'أو مضمومة', pronunciationOpposite: 'إيو', pronunciationLatin: 'u', soundHint: 'ضم الشفتين أثناء نطق "إي"', exampleWord: 'Lune', examplePronunciation: 'لون', exampleMeaning: 'قمر' },
  { letter: 'V v', name: 'فيه', pronunciationOpposite: 'ف', pronunciationLatin: 'v', soundHint: 'مثل V الإنجليزية', exampleWord: 'Ville', examplePronunciation: 'فيل', exampleMeaning: 'مدينة' },
];

const SPANISH_LETTERS: AlphabetLetter[] = [
  { letter: 'A a', name: 'آ', pronunciationOpposite: 'آ', pronunciationLatin: 'a', soundHint: 'ألف صافية ثابتة النطق', exampleWord: 'Agua', examplePronunciation: 'أغوا', exampleMeaning: 'ماء' },
  { letter: 'B b', name: 'بي', pronunciationOpposite: 'ب', pronunciationLatin: 'b', soundHint: 'باء واضحة', exampleWord: 'Bueno', examplePronunciation: 'بوينو', exampleMeaning: 'جيد' },
  { letter: 'C c', name: 'ثي', pronunciationOpposite: 'ث / ك', pronunciationLatin: 'th / k', soundHint: 'ثاء قبل e/i وكاف في الباقي', exampleWord: 'Casa', examplePronunciation: 'كاسا', exampleMeaning: 'منزل' },
  { letter: 'E e', name: 'إيه', pronunciationOpposite: 'إيه', pronunciationLatin: 'e', soundHint: 'كسرة مفتوحة ثابتة', exampleWord: 'Escuela', examplePronunciation: 'إسكويلا', exampleMeaning: 'مدرسة' },
  { letter: 'G g', name: 'خي', pronunciationOpposite: 'خ / غ', pronunciationLatin: 'kh / g', soundHint: 'خاء قبل e/i وجيم قاهرية في الباقي', exampleWord: 'Gracias', examplePronunciation: 'غراثياس', exampleMeaning: 'شكراً' },
  { letter: 'H h', name: 'آتشي', pronunciationOpposite: 'صامت', pronunciationLatin: '(silent)', soundHint: 'لا يُنطق مطلقاً في الإسبانية', exampleWord: 'Hola', examplePronunciation: 'أولا', exampleMeaning: 'مرحباً' },
  { letter: 'I i', name: 'إي', pronunciationOpposite: 'إي', pronunciationLatin: 'i', soundHint: 'كسرة ممدودة', exampleWord: 'Isla', examplePronunciation: 'إيسلا', exampleMeaning: 'جزيرة' },
  { letter: 'J j', name: 'خوتا', pronunciationOpposite: 'خ', pronunciationLatin: 'kh', soundHint: 'خاء عربية واضحة تماماً', exampleWord: 'Jardín', examplePronunciation: 'خاردين', exampleMeaning: 'حديقة' },
  { letter: 'Ll ll', name: 'إيلي', pronunciationOpposite: 'ي', pronunciationLatin: 'y', soundHint: 'يُنطق مثل الياء العربية غالباً', exampleWord: 'Llamar', examplePronunciation: 'يامار', exampleMeaning: 'ينادي / يسمي' },
  { letter: 'Ñ ñ', name: 'إينيي', pronunciationOpposite: 'نيي', pronunciationLatin: 'ny', soundHint: 'نون متبوعة بياء سريعة', exampleWord: 'Mañana', examplePronunciation: 'مانيانا', exampleMeaning: 'غداً / صباحاً' },
  { letter: 'O o', name: 'أو', pronunciationOpposite: 'أو', pronunciationLatin: 'o', soundHint: 'أو صافية', exampleWord: 'Ojo', examplePronunciation: 'أوخو', exampleMeaning: 'عين' },
  { letter: 'R r', name: 'إيري', pronunciationOpposite: 'ر', pronunciationLatin: 'r', soundHint: 'راء قوية ومكررة', exampleWord: 'Río', examplePronunciation: 'ريو', exampleMeaning: 'نهر' },
  { letter: 'U u', name: 'أوُ', pronunciationOpposite: 'أوُ', pronunciationLatin: 'u', soundHint: 'ضمة ممدودة', exampleWord: 'Uno', examplePronunciation: 'أونو', exampleMeaning: 'واحد' },
];

const GERMAN_LETTERS: AlphabetLetter[] = [
  { letter: 'A a', name: 'آ', pronunciationOpposite: 'آ', pronunciationLatin: 'a', soundHint: 'ألف صافية', exampleWord: 'Apfel', examplePronunciation: 'أبفل', exampleMeaning: 'تفاحة' },
  { letter: 'Ä ä', name: 'آ أوملاوت', pronunciationOpposite: 'إيه', pronunciationLatin: 'ae', soundHint: 'فتحة ممالة نحو الكسر', exampleWord: 'Mädchen', examplePronunciation: 'ميدشن', exampleMeaning: 'فتاة' },
  { letter: 'Ö ö', name: 'أو أوملاوت', pronunciationOpposite: 'أو ممالة', pronunciationLatin: 'oe', soundHint: 'نطق إيه مع تدوير الشفتين', exampleWord: 'Schön', examplePronunciation: 'شون', exampleMeaning: 'جميل' },
  { letter: 'Ü ü', name: 'أوُ أوملاوت', pronunciationOpposite: 'إيو', pronunciationLatin: 'ue', soundHint: 'نطق إي مع ضم الشفتين', exampleWord: 'Tür', examplePronunciation: 'تور', exampleMeaning: 'باب' },
  { letter: 'ß', name: 'إس تسيت', pronunciationOpposite: 'س', pronunciationLatin: 'ss', soundHint: 'سين مشددة في نهاية الكلمات', exampleWord: 'Straße', examplePronunciation: 'شتراسه', exampleMeaning: 'شارع' },
  { letter: 'J j', name: 'يوت', pronunciationOpposite: 'ي', pronunciationLatin: 'y', soundHint: 'يُنطق دائماً مثل الياء العربية', exampleWord: 'Ja', examplePronunciation: 'يا', exampleMeaning: 'نعم' },
  { letter: 'V v', name: 'فاو', pronunciationOpposite: 'ف', pronunciationLatin: 'f', soundHint: 'يُنطق فاءً في الكلمات الألمانية الأصيلة', exampleWord: 'Vater', examplePronunciation: 'فاتر', exampleMeaning: 'أب' },
  { letter: 'W w', name: 'في', pronunciationOpposite: 'ف / v', pronunciationLatin: 'v', soundHint: 'يُنطق مثل V الإنجليزية', exampleWord: 'Wasser', examplePronunciation: 'فاسر', exampleMeaning: 'ماء' },
  { letter: 'Z z', name: 'تسيت', pronunciationOpposite: 'تس', pronunciationLatin: 'ts', soundHint: 'تاء + سين معاً', exampleWord: 'Zeit', examplePronunciation: 'تسايت', exampleMeaning: 'وقت' },
  { letter: 'Sch', name: 'إس سي إتش', pronunciationOpposite: 'ش', pronunciationLatin: 'sh', soundHint: 'شين صافية', exampleWord: 'Schule', examplePronunciation: 'شوله', exampleMeaning: 'مدرسة' },
];

const PORTUGUESE_LETTERS: AlphabetLetter[] = [
  { letter: 'A a', name: 'آ', pronunciationOpposite: 'آ', pronunciationLatin: 'a', soundHint: 'ألف مفتوحة صافية، وتخفف أحياناً في نهاية الكلمة', exampleWord: 'Água', examplePronunciation: 'آغوا', exampleMeaning: 'ماء' },
  { letter: 'Ã ã', name: 'آ أنفية', pronunciationOpposite: 'آنْ', pronunciationLatin: 'ã', soundHint: 'ألف ذات غُنّة أنفية مميزة في البرتغالية', exampleWord: 'Amanhã', examplePronunciation: 'أمانيَان', exampleMeaning: 'غداً' },
  { letter: 'B b', name: 'بي', pronunciationOpposite: 'ب', pronunciationLatin: 'b', soundHint: 'باء عربية واضحة', exampleWord: 'Bom dia', examplePronunciation: 'بون ديا', exampleMeaning: 'صباح الخير' },
  { letter: 'C c', name: 'سي', pronunciationOpposite: 'س / ك', pronunciationLatin: 's / k', soundHint: 'سين قبل e/i وكاف في الباقي', exampleWord: 'Café', examplePronunciation: 'كافيه', exampleMeaning: 'قهوة' },
  { letter: 'Ç ç', name: 'سي سيديليا', pronunciationOpposite: 'س', pronunciationLatin: 's', soundHint: 'تُنطق دائماً سيناً صافية قبل a/o/u', exampleWord: 'Coração', examplePronunciation: 'كوراساو', exampleMeaning: 'قلب' },
  { letter: 'É é', name: 'إيه مفتوحة', pronunciationOpposite: 'إيه', pronunciationLatin: 'é', soundHint: 'كسرة مفتوحة واضحة ومنبورة', exampleWord: 'Café', examplePronunciation: 'كافيه', exampleMeaning: 'قهوة' },
  { letter: 'Ê ê', name: 'إيه مغلقة', pronunciationOpposite: 'إي', pronunciationLatin: 'ê', soundHint: 'كسرة ناعمة مغلقة', exampleWord: 'Você', examplePronunciation: 'فوسيه', exampleMeaning: 'أنت' },
  { letter: 'G g', name: 'جي', pronunciationOpposite: 'ژ / غ', pronunciationLatin: 'zh / g', soundHint: 'ژ شامية قبل e/i وجيم قاهرية قبل a/o/u', exampleWord: 'Gente', examplePronunciation: 'ژينتي', exampleMeaning: 'ناس' },
  { letter: 'H h', name: 'أغا', pronunciationOpposite: 'صامت', pronunciationLatin: '(silent)', soundHint: 'حرف صامت في بداية الكلمة', exampleWord: 'Hoje', examplePronunciation: 'أوژي', exampleMeaning: 'اليوم' },
  { letter: 'J j', name: 'ژوتا', pronunciationOpposite: 'ژ', pronunciationLatin: 'zh', soundHint: 'جيم شامية ناعمة دائماً', exampleWord: 'Janela', examplePronunciation: 'ژانيلا', exampleMeaning: 'نافذة' },
  { letter: 'Lh', name: 'إل إتش', pronunciationOpposite: 'لْي', pronunciationLatin: 'ly', soundHint: 'لام متبوعة بياء خفيفة في نطق واحد', exampleWord: 'Trabalho', examplePronunciation: 'ترابالْيو', exampleMeaning: 'عمل' },
  { letter: 'Nh', name: 'إن إتش', pronunciationOpposite: 'نْي', pronunciationLatin: 'ny', soundHint: 'نون متبوعة بياء أنفية ناعمة', exampleWord: 'Manhã', examplePronunciation: 'مانيان', exampleMeaning: 'صباح' },
  { letter: 'Õ õ', name: 'أو أنفية', pronunciationOpposite: 'أونْ', pronunciationLatin: 'õ', soundHint: 'واو أنفية لطيفة خاصة في صيغ الجمع', exampleWord: 'Lições', examplePronunciation: 'ليصوينش', exampleMeaning: 'تدريبات / مراحل' },
  { letter: 'R r', name: 'إيري', pronunciationOpposite: 'ر / هـ', pronunciationLatin: 'r / h', soundHint: 'مكررة خفيفة في الوسط وقوية أو حلقية في البداية', exampleWord: 'Rua', examplePronunciation: 'هوا / روا', exampleMeaning: 'شارع' },
  { letter: 'S s', name: 'إيسي', pronunciationOpposite: 'س / ز / ش', pronunciationLatin: 's / z / sh', soundHint: 'زاي بين حرفين صوتيين وسين في البداية', exampleWord: 'Sol', examplePronunciation: 'سول', exampleMeaning: 'شمس' },
  { letter: 'Z z', name: 'زي', pronunciationOpposite: 'ز', pronunciationLatin: 'z', soundHint: 'زاي عربية واضحة', exampleWord: 'Zero', examplePronunciation: 'زيرو', exampleMeaning: 'صفر' },
];

const ARABIC_LETTERS: AlphabetLetter[] = [
  { letter: 'أ / ا', name: 'ألف', pronunciationOpposite: 'آ / a', pronunciationLatin: 'a', soundHint: 'مد مفتوح صافٍ', exampleWord: 'أمل', examplePronunciation: 'Amal', exampleMeaning: 'Hope' },
  { letter: 'ب', name: 'باء', pronunciationOpposite: 'ب / b', pronunciationLatin: 'b', soundHint: 'انطباق الشفتين', exampleWord: 'بيت', examplePronunciation: 'Bayt', exampleMeaning: 'House' },
  { letter: 'ت', name: 'تاء', pronunciationOpposite: 'ت / t', pronunciationLatin: 't', soundHint: 'تاء مرققة', exampleWord: 'تمر', examplePronunciation: 'Tamr', exampleMeaning: 'Dates' },
  { letter: 'ج', name: 'جيم', pronunciationOpposite: 'ج / j', pronunciationLatin: 'j', soundHint: 'جيم فصيحة', exampleWord: 'جميل', examplePronunciation: 'Jameel', exampleMeaning: 'Beautiful' },
  { letter: 'ح', name: 'حاء', pronunciationOpposite: 'ح / h', pronunciationLatin: 'ḥ', soundHint: 'حلقية صافية دون همز', exampleWord: 'حب', examplePronunciation: 'Hubb', exampleMeaning: 'Love' },
  { letter: 'خ', name: 'خاء', pronunciationOpposite: 'خ / kh', pronunciationLatin: 'kh', soundHint: 'حلقية مهموسة', exampleWord: 'خير', examplePronunciation: 'Khayr', exampleMeaning: 'Good' },
  { letter: 'س', name: 'سين', pronunciationOpposite: 'س / s', pronunciationLatin: 's', soundHint: 'سين صافية', exampleWord: 'سلام', examplePronunciation: 'Salam', exampleMeaning: 'Peace' },
  { letter: 'ش', name: 'شين', pronunciationOpposite: 'ش / sh', pronunciationLatin: 'sh', soundHint: 'شين متفشية', exampleWord: 'شمس', examplePronunciation: 'Shams', exampleMeaning: 'Sun' },
  { letter: 'ع', name: 'عين', pronunciationOpposite: 'ع / 3', pronunciationLatin: '‘a', soundHint: 'حرف حلقي عربي أصيل', exampleWord: 'علم', examplePronunciation: '‘Ilm', exampleMeaning: 'Knowledge' },
  { letter: 'ق', name: 'قاف', pronunciationOpposite: 'ق / q', pronunciationLatin: 'q', soundHint: 'مفخمة من أقصى اللسان', exampleWord: 'قلم', examplePronunciation: 'Qalam', exampleMeaning: 'Pen' },
  { letter: 'م', name: 'ميم', pronunciationOpposite: 'م / m', pronunciationLatin: 'm', soundHint: 'شفوية أنفية', exampleWord: 'ماء', examplePronunciation: 'Ma’', exampleMeaning: 'Water' },
];

const ITALIAN_LETTERS: AlphabetLetter[] = [
  { letter: 'A a', name: 'آ', pronunciationOpposite: 'آ', pronunciationLatin: 'a', soundHint: 'ألف صافية', exampleWord: 'Amico', examplePronunciation: 'أميكو', exampleMeaning: 'صديق' },
  { letter: 'C c', name: 'تشي', pronunciationOpposite: 'تش / ك', pronunciationLatin: 'ch / k', soundHint: 'تش قبل e/i وكاف في الباقي', exampleWord: 'Ciao', examplePronunciation: 'تشاو', exampleMeaning: 'مرحباً / وداعاً' },
  { letter: 'E e', name: 'إيه', pronunciationOpposite: 'إيه', pronunciationLatin: 'e', soundHint: 'كسرة مفتوحة', exampleWord: 'Espresso', examplePronunciation: 'إسبريسو', exampleMeaning: 'قهوة إسبريسو' },
  { letter: 'G g', name: 'جي', pronunciationOpposite: 'ج / غ', pronunciationLatin: 'j / g', soundHint: 'جيم معطشة قبل e/i وجيم قاهرية في الباقي', exampleWord: 'Grazie', examplePronunciation: 'غراتسيه', exampleMeaning: 'شكراً' },
  { letter: 'H h', name: 'أكّا', pronunciationOpposite: 'صامت', pronunciationLatin: '(silent)', soundHint: 'حرف صامت يغير نطق c/g قبله فقط', exampleWord: 'Hotel', examplePronunciation: 'أوتيل', exampleMeaning: 'فندق' },
  { letter: 'I i', name: 'إي', pronunciationOpposite: 'إي', pronunciationLatin: 'i', soundHint: 'كسرة صافية واضحة', exampleWord: 'Italia', examplePronunciation: 'إيطاليا', exampleMeaning: 'إيطاليا' },
  { letter: 'O o', name: 'أو', pronunciationOpposite: 'أو', pronunciationLatin: 'o', soundHint: 'أو دائرية', exampleWord: 'Buongiorno', examplePronunciation: 'بونجورنو', exampleMeaning: 'صباح الخير' },
  { letter: 'R r', name: 'إيرّي', pronunciationOpposite: 'ر', pronunciationLatin: 'r', soundHint: 'راء عربية واضحة', exampleWord: 'Roma', examplePronunciation: 'روما', exampleMeaning: 'روما' },
  { letter: 'S s', name: 'إيسّي', pronunciationOpposite: 'س / ز', pronunciationLatin: 's / z', soundHint: 'سين في البداية وزاي بين حرفين صوتيين', exampleWord: 'Sole', examplePronunciation: 'سولي', exampleMeaning: 'شمس' },
  { letter: 'Z z', name: 'تسيتا', pronunciationOpposite: 'تس / دز', pronunciationLatin: 'ts / dz', soundHint: 'تاء + سين سريعة', exampleWord: 'Pizza', examplePronunciation: 'بيتزا', exampleMeaning: 'بيتزا' },
];

export const LANGUAGE_ALPHABETS: Record<string, LanguageAlphabet> = {
  الروسية: {
    language: 'الروسية',
    scriptName: 'الأبجدية السيريلية الروسية (33 حرفاً)',
    description: 'تعلّم جميع الحروف الروسية الـ 33 مع نطقها المكتوب مباشرة تحت كل حرف ومثال ناطق لكل حرف.',
    letters: RUSSIAN_LETTERS,
  },
  الإنجليزية: {
    language: 'الإنجليزية',
    scriptName: 'الأبجدية الإنجليزية (26 حرفاً)',
    description: 'الحروف الإنجليزية كاملة مع نطقها المقابل بالعربية ومثال تطبيقي.',
    letters: ENGLISH_LETTERS,
  },
  الفرنسية: {
    language: 'الفرنسية',
    scriptName: 'الأبجدية الفرنسية والحروف الصوتية المميزة',
    description: 'أهم الحروف الفرنسية والحروف ذات العلامات الصوتية ونطقها المباشر.',
    letters: FRENCH_LETTERS,
  },
  الإسبانية: {
    language: 'الإسبانية',
    scriptName: 'الأبجدية الإسبانية الواضحة',
    description: 'أحرف الإسبانية الأساسية مع الحرف المميز Ñ ونطق كل حرف تحته مباشرة.',
    letters: SPANISH_LETTERS,
  },
  الألمانية: {
    language: 'الألمانية',
    scriptName: 'الحروف الألمانية الخاصة (Umlauts & ß)',
    description: 'الحروف الألمانية المميزة والأصوات المختلفة عن الإنجليزية مع نطقها المقابل.',
    letters: GERMAN_LETTERS,
  },
  الإيطالية: {
    language: 'الإيطالية',
    scriptName: 'الأبجدية الإيطالية الموسيقية',
    description: 'مفاتيح نطق الحروف الإيطالية مع الأمثلة اليومية.',
    letters: ITALIAN_LETTERS,
  },
  البرتغالية: {
    language: 'البرتغالية',
    scriptName: 'الأبجدية البرتغالية والأصوات الأنفية (Ã / Õ / Ç)',
    description: 'مفاتيح نطق الحروف البرتغالية المميزة والمقاطع الأنفية مع نطقها تحت كل حرف.',
    letters: PORTUGUESE_LETTERS,
  },
  العربية: {
    language: 'العربية',
    scriptName: 'الأبجدية العربية',
    description: 'مختارات من الحروف العربية ومخارجها مع النطق المقابل.',
    letters: ARABIC_LETTERS,
  },
};

export function hasStaticAlphabet(targetLanguage: string): boolean {
  return Boolean(LANGUAGE_ALPHABETS[targetLanguage]);
}

export function getStarterAlphabet(targetLanguage: string): LanguageAlphabet | null {
  return LANGUAGE_ALPHABETS[targetLanguage] || null;
}

export function getOppositePronunciation(letter: AlphabetLetter, nativeLanguage: string): string {
  if (nativeLanguage === 'العربية' || nativeLanguage === 'الأردية' || nativeLanguage === 'الفارسية') {
    return letter.pronunciationOpposite;
  }
  return letter.pronunciationLatin || letter.pronunciationOpposite;
}
