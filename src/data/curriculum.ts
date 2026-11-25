import { ExercisePack, InteractiveSprintStep, StageDefinition, WordWritingItem } from '../types';

interface StarterLessonInternal {
  id: string;
  title: string;
  summary: string;
  grammarTip: string;
  culturalNote: string;
  level: number;
  vocabulary: unknown[];
  dialogues: unknown[];
  readingParagraph: {
    title: string;
    text: string;
    translation: string;
    keyWords: string[];
  };
}

export interface StarterContent {
  lessons?: StarterLessonInternal[];
  exercises: ExercisePack;
}

type LangPackFactory = (level: number) => StarterContent;
type SprintFactory = (level: number) => InteractiveSprintStep[];

/* ============================================================================
   1. RUSSIAN (الروسية) — Distinct Curricula & Exercises for Levels 1..5
   ============================================================================ */
function buildRussianStarter(level: number): StarterContent {
  if (level === 1) {
    const wordWriting: WordWritingItem[] = [
      {
        word: 'Привет',
        pronunciation: 'بريفييت',
        meaning: 'مرحباً (ودّية)',
        explanation: 'أشهر تحية روسية يومية بين الأصدقاء والشباب. الحرف П يُنطق (پ/ب مهموسة)، وР هو الراء، وЕ يُنطق (ييه).',
        example: 'Привет, как дела?',
        exampleTranslation: 'مرحباً، كيف الحال؟',
      },
      {
        word: 'Спасибо',
        pronunciation: 'سباسيبو',
        meaning: 'شكراً لك',
        explanation: 'تأتي تاريخياً من عبارة تعني "ليحفظك الله"، وتُستخدم في جميع المواقف الرسمية واليومية عند الشكر.',
        example: 'Большое спасибо!',
        exampleTranslation: 'شكراً جزيلاً!',
      },
      {
        word: 'Вода',
        pronunciation: 'فادا',
        meaning: 'ماء',
        explanation: 'اسم مؤنث ينتهي بحرف А. لاحظ أن حرف О غير المنبور يُنطق أقرب إلى الألف الخفيفة (فادا).',
        example: 'Вода, пожалуйста.',
        exampleTranslation: 'ماء، من فضلك.',
      },
      {
        word: 'Друг',
        pronunciation: 'دروغ / دروك',
        meaning: 'صديق',
        explanation: 'كلمة مذكرة تعني الصديق المقرب. في نهاية الكلمة يميل صوت Г ليصبح خفيفاً أقرب لـ ك.',
        example: 'Он мой лучший друг.',
        exampleTranslation: 'هو أفضل صديق لي.',
      },
      {
        word: 'Книга',
        pronunciation: 'كنيغا',
        meaning: 'كتاب',
        explanation: 'كلمة مؤنثة تنتهي بـ а، وحرف К يُنطق دائماً كافاً واضحة قبل النون دون إسقاط.',
        example: 'Это интересная книга.',
        exampleTranslation: 'هذا كتاب ممتع.',
      },
    ];

    return {
      lessons: [
        {
          id: 'ru-l1-greetings',
          title: 'الدرس 1: الحروف السيريلية والتحيات الأولى (مبتدئ)',
          summary: 'ابدأ رحلتك في الروسية بتعلم التحيات الأساسية وقراءة الكلمات الروسية البسيطة بثقة.',
          grammarTip: 'في اللغة الروسية لا يوجد فعل "يكون" في الزمن الحاضر ولا توجد أدوات تعريف (a/the). نقول مباشرة: Я Тарик (أنا طارق).',
          culturalNote: 'استخدم Привет (بريفييت) مع الأصدقاء، وЗдравствуйте (زدراستفويتي) في المواقف الرسمية أو مع كبار السن.',
          level: 1,
          vocabulary: [
            { word: 'Привет', pronunciation: 'بريفييت', translation: 'مرحباً', example: 'Привет! Меня зовут Тарик.', exampleTranslation: 'مرحباً! اسمي طارق.' },
            { word: 'Доброе утро', pronunciation: 'دوبروي أوترو', translation: 'صباح الخير', example: 'Доброе утро, друг!', exampleTranslation: 'صباح الخير يا صديقي!' },
            { word: 'Спасибо', pronunciation: 'سباسيبو', translation: 'شكراً لك', example: 'Большое спасибо за помощь.', exampleTranslation: 'شكراً جزيلاً على المساعدة.' },
            { word: 'Пожалуйста', pronunciation: 'باجالوستا', translation: 'من فضلك / عفواً', example: 'Чай, пожалуйста.', exampleTranslation: 'شاي، من فضلك.' },
            { word: 'Пока', pronunciation: 'باكا', translation: 'إلى اللقاء', example: 'Пока! До завтра.', exampleTranslation: 'إلى اللقاء! أراك غداً.' },
          ],
          dialogues: [
            { speaker: 'طارق', line: 'Привет! Меня зовут Тарик.', translation: 'مرحباً! اسمي طارق.' },
            { speaker: 'آنا', line: 'Привет, Тарик! Очень приятно.', translation: 'مرحباً طارق! تشرفت بمعرفتك.' },
            { speaker: 'طارق', line: 'Как дела?', translation: 'كيف الحال؟' },
            { speaker: 'آنا', line: 'Хорошо, спасибо!', translation: 'بخير، شكراً!' },
          ],
          readingParagraph: {
            title: 'بدايتي مع الروسية',
            text: 'Привет! Меня зовут Тарик. Каждое утро я пью чай и читаю новую книгу. Мне нравится русский язык.',
            translation: 'مرحباً! اسمي طارق. كل صباح أشرب الشاي وأقرأ كتاباً جديداً. أحب اللغة الروسية.',
            keyWords: ['Привет', 'утро', 'чай', 'книга'],
          },
        },
        {
          id: 'ru-l1-basics',
          title: 'الدرس 2: الكلمات الأساسية والأرقام الأولى',
          summary: 'تعرّف على أسماء الأشياء اليومية وطريقة السؤال البسيط في الروسية.',
          grammarTip: 'تنتهي الأسماء المذكرة غالباً بحرف ساكن مثل Дом (منزل)، والمؤنثة بـ а/я مثل Вода (ماء)، والمحايدة بـ о/е مثل Утро (صباح).',
          culturalNote: 'الشاي (Чай) مشروب أساسي في الضيافة الروسية ويُقدّم غالباً مع الليمون أو الحلويات.',
          level: 1,
          vocabulary: [
            { word: 'Вода', pronunciation: 'فادا', translation: 'ماء', example: 'Дайте воду, пожалуйста.', exampleTranslation: 'أعطني ماءً، من فضلك.' },
            { word: 'Дом', pronunciation: 'دوم', translation: 'منزل', example: 'Мой дом рядом.', exampleTranslation: 'منزلي قريب.' },
            { word: 'Книга', pronunciation: 'كنيغا', translation: 'كتاب', example: 'Я читаю книгу.', exampleTranslation: 'أنا أقرأ كتاباً.' },
            { word: 'Хорошо', pronunciation: 'خاراشو', translation: 'جيد / حسناً', example: 'Всё хорошо!', exampleTranslation: 'كل شيء على ما يرام!' },
          ],
          dialogues: [
            { speaker: 'عمر', line: 'Доброе утро! Что это?', translation: 'صباح الخير! ما هذا؟' },
            { speaker: 'إيفان', line: 'Это русская книга.', translation: 'هذا كتاب روسي.' },
          ],
          readingParagraph: {
            title: 'في الصباح',
            text: 'Доброе утро! Сегодня хороший день. Мой друг читает книгу дома.',
            translation: 'صباح الخير! اليوم يوم جميل. صديقي يقرأ كتاباً في المنزل.',
            keyWords: ['Доброе утро', 'день', 'друг', 'дома'],
          },
        },
      ],
      exercises: {
        wordWriting,
        writing: [
          { prompt: 'اكتب بالروسية: مرحباً، اسمي طارق.', expected: 'Привет, меня зовут Тарик.', hint: 'Привет + меня зовут...' },
          { prompt: 'اكتب بالروسية: شكراً جزيلاً.', expected: 'Большое спасибо.', hint: 'Большое + спасибо' },
        ],
        speaking: [
          { phrase: 'Привет! Как дела?', phonetic: 'بريفييت! كاك ديلا؟', translation: 'مرحباً! كيف الحال؟' },
          { phrase: 'Доброе утро, спасибо!', phonetic: 'دوبروي أوترو، سباسيبو!', translation: 'صباح الخير، شكراً!' },
        ],
        fillBlanks: [
          { before: 'Меня', after: 'Тарик.', options: ['зовут', 'вода', 'книга', 'утро'], correct: 'зовут', translation: 'اسمي طارق.' },
          { before: 'Большое', after: 'за помощь!', options: ['спасибо', 'привет', 'пока', 'дом'], correct: 'спасибо', translation: 'شكراً جزيلاً على المساعدة!' },
          { before: 'Доброе', after: ', мой друг!', options: ['утро', 'чай', 'книга', 'вода'], correct: 'утро', translation: 'صباح الخير يا صديقي!' },
        ],
        matching: [
          { target: 'Привет', native: 'مرحباً', pronunciation: 'بريفييت' },
          { target: 'Спасибо', native: 'شكراً', pronunciation: 'سباسيبو' },
          { target: 'Вода', native: 'ماء', pronunciation: 'فادا' },
          { target: 'Друг', native: 'صديق', pronunciation: 'دروغ' },
          { target: 'Книга', native: 'كتاب', pronunciation: 'كنيغا' },
        ],
        reading: {
          title: 'صباح طارق',
          paragraph: 'Привет! Меня зовут Тарик. Каждое утро я пью чай и читаю новую книгу.',
          translation: 'مرحباً! اسمي طارق. كل صباح أشرب الشاي وأقرأ كتاباً جديداً.',
          question: 'ماذا يشرب طارق كل صباح؟',
          options: ['الشاي (чай)', 'الحليب (молоко)', 'العصير (сок)'],
          correctIndex: 0,
        },
      },
    };
  }

  if (level === 2) {
    return {
      lessons: [
        {
          id: 'ru-l2-daily',
          title: 'الدرس 1: الروتين اليومي والتسوق بالروسية (مستوى 2)',
          summary: 'تجاوز الكلمات المفردة إلى تكوين جمل مترابطة في المتجر والمقهى والمواصلات.',
          grammarTip: 'الأفعال في المضارع الروسية تتصرف حسب الضمير: Я иду (أنا أذهب)، Ты идёшь (أنت تذهب)، Мы идём (نحن نذهب).',
          culturalNote: 'في المحلات الروسية يمكنك استخدام عبارة "Сколько это стоит?" للسؤال اللطيف عن السعر.',
          level: 2,
          vocabulary: [
            { word: 'Магазин', pronunciation: 'ماغازين', translation: 'متجر', example: 'Я иду в магазин.', exampleTranslation: 'أنا ذاهب إلى المتجر.' },
            { word: 'Вокзал', pronunciation: 'فاكزال', translation: 'محطة القطار', example: 'Где находится вокзал?', exampleTranslation: 'أين تقع محطة القطار؟' },
            { word: 'Сколько стоит', pronunciation: 'سكولكو ستويت', translation: 'كم السعر؟', example: 'Сколько стоит этот билет?', exampleTranslation: 'كم سعر هذه التذكرة؟' },
            { word: 'Сегодня', pronunciation: 'سيفودنيا', translation: 'اليوم', example: 'Сегодня у меня много дел.', exampleTranslation: 'اليوم لدي الكثير من الأعمال.' },
          ],
          dialogues: [
            { speaker: 'سالم', line: 'Извините, где находится метро?', translation: 'عفواً، أين تقع محطة المترو؟' },
            { speaker: 'أولغا', line: 'Идите прямо и потом налево.', translation: 'امشِ للأمام ثم إلى اليسار.' },
          ],
          readingParagraph: {
            title: 'في طريقي للعمل',
            text: 'Обычно я просыпаюсь в семь часов утра. Потом я покупаю кофе в кафе рядом с вокзалом и еду на работу на метро.',
            translation: 'عادةً أستيقظ في السابعة صباحاً. ثم أشتري القهوة من المقهى القريب من المحطة وأذهب إلى العمل بالمترو.',
            keyWords: ['Обычно', 'покупаю', 'вокзал', 'метро'],
          },
        },
      ],
      exercises: {
        wordWriting: [
          {
            word: 'Магазин',
            pronunciation: 'ماغازين',
            meaning: 'متجر / محل',
            explanation: 'تُستخدم للإشارة إلى أي محل تجاري أو سوبرماركت، ويُلفظ المقطع الثاني (زين) بنبرة واضحة.',
            example: 'Магазин открыт до девяти.',
            exampleTranslation: 'المتجر مفتوح حتى التاسعة.',
          },
          {
            word: 'Сегодня',
            pronunciation: 'سيفودنيا',
            meaning: 'اليوم',
            explanation: 'من الكلمات الشائعة جداً، ولاحظ أن حرف Г في وسطها يُنطق (ف) استثنائياً: سيفودنيا.',
            example: 'Сегодня хорошая погода.',
            exampleTranslation: 'الطقس جميل اليوم.',
          },
          {
            word: 'Билет',
            pronunciation: 'بيليت',
            meaning: 'تذكرة',
            explanation: 'تُستخدم لتذكرة القطار أو الطائرة أو السينما.',
            example: 'Мне нужен один билет.',
            exampleTranslation: 'أحتاج إلى تذكرة واحدة.',
          },
        ],
        writing: [
          { prompt: 'اكتب بالروسية: كم سعر هذه التذكرة؟', expected: 'Сколько стоит этот билет?', hint: 'Сколько стоит + этот билет' },
          { prompt: 'اكتب بالروسية: أنا ذاهب إلى المتجر اليوم.', expected: 'Сегодня я иду в магазин.', hint: 'Сегодня я иду в...' },
        ],
        speaking: [
          { phrase: 'Извините, сколько это стоит?', phonetic: 'إزفينيتي، سكولكو إيتو ستويت؟', translation: 'عفواً، كم سعر هذا؟' },
          { phrase: 'Где находится ближайший вокзал?', phonetic: 'غديه ناخوديتسا بليجايشي فاكزال؟', translation: 'أين تقع أقرب محطة قطار؟' },
        ],
        fillBlanks: [
          { before: 'Я часто', after: 'хлеб и сыр.', options: ['покупаю', 'метро', 'вокзал', 'вчера'], correct: 'покупаю', translation: 'أنا أشتري الخبز والجبن غالباً.' },
          { before: 'Где', after: 'станция метро?', options: ['находится', 'стоит', 'читаю', 'иду'], correct: 'находится', translation: 'أين تقع محطة المترو؟' },
          { before: 'Сколько', after: 'чашка чая?', options: ['стоит', 'сегодня', 'утро', 'друг'], correct: 'стоит', translation: 'كم يكلف كوب الشاي؟' },
        ],
        matching: [
          { target: 'Магазин', native: 'متجر', pronunciation: 'ماغازين' },
          { target: 'Сегодня', native: 'اليوم', pronunciation: 'سيفودنيا' },
          { target: 'Билет', native: 'تذكرة', pronunciation: 'بيليت' },
          { target: 'Работа', native: 'عمل', pronunciation: 'رابوتا' },
          { target: 'Улица', native: 'شارع', pronunciation: 'أوليتسا' },
        ],
        reading: {
          title: 'الصباح العملي',
          paragraph: 'Обычно я просыпаюсь в семь часов утра. Потом я покупаю кофе в кафе рядом с вокзалом и еду на работу на метро.',
          translation: 'عادةً أستيقظ في السابعة صباحاً. ثم أشتري القهوة من مقهى قريب من المحطة وأذهب إلى العمل بالمترو.',
          question: 'بأي وسيلة يذهب المتحدث إلى العمل؟',
          options: ['بالمترو (на метро)', 'بالطائرة (на самолёте)', 'سيراً فقط'],
          correctIndex: 0,
        },
      },
    };
  }

  if (level === 3) {
    return {
      lessons: [
        {
          id: 'ru-l3-stories',
          title: 'الدرس 1: الأزمنة وسرد التجارب بالروسية (متوسط B1)',
          summary: 'أتقن صياغة الماضي والمستقبل والتعبير عن الأسباب والآراء بوضوح.',
          grammarTip: 'تُفرق الروسية بين الفعل غير المكتمل (Несовершенный вид) للحدث المستمر والفعل المكتمل (Совершенный вид) للنتيجة المنجزة.',
          culturalNote: 'عند التعبير عن الرأي بأدب يقول المتحدثون الروس: "По моему мнению..." أو "Я считаю, что...".',
          level: 3,
          vocabulary: [
            { word: 'Путешествие', pronunciation: 'بوتيشيستفيي', translation: 'رحلة / سفر', example: 'Это было незабываемое путешествие.', exampleTranslation: 'كانت رحلة لا تُنسى.' },
            { word: 'Опыт', pronunciation: 'أوبيت', translation: 'خبرة / تجربة', example: 'Я получил ценный опыт.', exampleTranslation: 'اكتسبت خبرة قيّمة.' },
            { word: 'Мнение', pronunciation: 'منينيي', translation: 'رأي', example: 'Каково ваше мнение об этом?', exampleTranslation: 'ما رأيك في هذا الأمر؟' },
            { word: 'Успех', pronunciation: 'أوسبيخ', translation: 'نجاح', example: 'Регулярная практика ведёт к успеху.', exampleTranslation: 'الممارسة المنتظمة تقود إلى النجاح.' },
          ],
          dialogues: [
            { speaker: 'سعيد', line: 'Как долго вы изучаете русский язык?', translation: 'منذ متى وأنت تدرس اللغة الروسية؟' },
            { speaker: 'إيلينا', line: 'Уже полгода, и с каждым днём я понимаю больше.', translation: 'منذ نصف عام، ومع كل يوم أفهم أكثر.' },
          ],
          readingParagraph: {
            title: 'سر الطلاقة المتوسطة',
            text: 'Когда я начал говорить по-русски каждый день, мой страх исчез. По моему мнению, важно не бояться ошибок и слушать живую речь.',
            translation: 'عندما بدأت أتحدث الروسية كل يوم، اختفى خوفي. في رأيي، من المهم ألا نخاف من الأخطاء وأن نستمع إلى الحديث الحي.',
            keyWords: ['говорить', 'страх', 'мнению', 'ошибок'],
          },
        },
      ],
      exercises: {
        wordWriting: [
          {
            word: 'Успех',
            pronunciation: 'أوسبيخ',
            meaning: 'نجاح / توفيق',
            explanation: 'اسم مذكر يُستخدم في السياقات الدراسية والمهنية، ومنه صفة Успешный (ناجح).',
            example: 'Желаю вам большого успеха!',
            exampleTranslation: 'أتمنى لكم نجاحاً كبيراً!',
          },
          {
            word: 'Мнение',
            pronunciation: 'منينيي',
            meaning: 'رأي / وجهة نظر',
            explanation: 'اسم محايد ينتهي بـ е، ويُستخدم كثيراً في النقاشات لإبداء الرأي الشخصي.',
            example: 'У каждого своё мнение.',
            exampleTranslation: 'لكل شخص رأيه الخاص.',
          },
        ],
        writing: [
          { prompt: 'اكتب بالروسية: في رأيي، الممارسة اليومية تقود إلى النجاح.', expected: 'По моему мнению, ежедневная практика ведёт к успеху.', hint: 'По моему мнению...' },
          { prompt: 'اكتب بالروسية: لقد اكتسبت خبرة قيّمة في هذا المشروع.', expected: 'Я получил ценный опыт в этом проекте.', hint: 'получил ценный опыт' },
        ],
        speaking: [
          { phrase: 'По моему мнению, важно говорить каждый день.', phonetic: 'با مويمو منينيو، فاجنو غافاريت كاجدي دين', translation: 'في رأيي، من المهم التحدث كل يوم.' },
          { phrase: 'Я хочу свободно обсуждать интересные темы.', phonetic: 'يا خاتشو سفوبودنو أوبسوجدات إنتيريسنيي تيمي', translation: 'أريد مناقشة المواضيع الشيقة بطلاقة.' },
        ],
        fillBlanks: [
          { before: 'По моему', after: ', этот метод очень эффективен.', options: ['мнению', 'вокзалу', 'чаю', 'билету'], correct: 'мнению', translation: 'في رأيي، هذه الطريقة فعالة جداً.' },
          { before: 'Ежедневное чтение', after: 'к успеху.', options: ['ведёт', 'спит', 'покупает', 'ждёт'], correct: 'ведёт', translation: 'القراءة اليومية تقود إلى النجاح.' },
          { before: 'Он получил ценный', after: 'на работе.', options: ['опыт', 'утро', 'чай', 'стол'], correct: 'опыт', translation: 'اكتسب خبرة قيّمة في العمل.' },
        ],
        matching: [
          { target: 'Успех', native: 'نجاح', pronunciation: 'أوسبيخ' },
          { target: 'Опыт', native: 'خبرة', pronunciation: 'أوبيت' },
          { target: 'Мнение', native: 'رأي', pronunciation: 'منينيي' },
          { target: 'Ошибка', native: 'خطأ', pronunciation: 'أشيبكا' },
          { target: 'Развитие', native: 'تطور', pronunciation: 'رازفيتيي' },
        ],
        reading: {
          title: 'كسر حاجز الخوف',
          paragraph: 'Когда я начал говорить по-русски каждый день, мой страх исчез. По моему мнению, важно не бояться ошибок и слушать живую речь.',
          translation: 'عندما بدأت أتحدث الروسية كل يوم، اختفى خوفي. في رأيي، من المهم ألا نخاف من الأخطاء وأن نستمع للحديث الحي.',
          question: 'ما النصيحة الأساسية التي يذكرها النص لتحسين التحدث؟',
          options: ['عدم الخوف من الأخطاء والاستماع للحديث الحي', 'تأجيل التحدث لسنوات', 'حفظ قوائم طويلة بدون صوت'],
          correctIndex: 0,
        },
      },
    };
  }

  // Level 4 & Level 5 Russian (Advanced B2 & Mastery C1/C2)
  const isLevel5 = level === 5;
  return {
    lessons: [
      {
        id: `ru-l${level}-mastery`,
        title: isLevel5
          ? 'الدرس 1: البلاغة الروسية والأمثال الأدبية (مستوى ممتاز C1/C2)'
          : 'الدرس 1: التعابير الاصطلاحية والأسلوب الاحترافي (مستوى متقدم B2)',
        summary: isLevel5
          ? 'صياغة الحجج العميقة، فهم الدلالات الثقافية الدقيقة، وتوظيف التراكيب البلاغية الراقية.'
          : 'إتقان الروابط المنطقية المركبة، والمناقشات المهنية، والتعابير الروسية الأصيلة.',
        grammarTip: isLevel5
          ? 'تُضفي صيغ اسم الفاعل الفعلي (Деепричастный оборот) مثل "Анализируя ситуацию..." تماسكاً وأناقة أدبية رفيعة.'
          : 'استخدم عبارة "Несмотря на то, что..." للتعبير عن التناقض بدقة عالية في الحوارات المهنية.',
        culturalNote: 'المثل الروسي الشهير "Век живи — век учись" يعني "عِشْ قرناً وتعلّم قرناً" ويُستشهد به في الأوساط الثقافية.',
        level,
        vocabulary: [
          { word: 'Мировоззрение', pronunciation: 'ميروفوزرينيي', translation: 'رؤية كونية / فلسفة حياة', example: 'Чтение классики расширяет мировоззрение.', exampleTranslation: 'قراءة الأدب الكلاسيكي توسّع الأفق الفكري.' },
          { word: 'Последовательность', pronunciation: 'باسليدوفاتيلنوست', translation: 'استمرارية / تسلسل منهجي', example: 'Последовательность — залог мастерства.', exampleTranslation: 'الاستمرارية هي ضمان الإتقان.' },
          { word: 'Убедительный', pronunciation: 'أوبيديتيلني', translation: 'مقنع / رصين', example: 'Она привела убедительный аргумент.', exampleTranslation: 'قدّمت حجة مقنعة.' },
          { word: 'Красноречие', pronunciation: 'كراسناريتشيي', translation: 'فصاحة وبلاغة', example: 'Его речь отличалась особым красноречием.', exampleTranslation: 'تميّز خطابه ببلاغة لافتة.' },
        ],
        dialogues: [
          { speaker: 'البروفيسور', line: 'Насколько глубоко язык отражает менталитет народа?', translation: 'إلى أي مدى تعكس اللغة عقلية الشعب؟' },
          { speaker: 'المتعلم', line: 'Несомненно, идиомы и пословицы передают многовековую мудрость.', translation: 'بلا شك، تنقل التعابير والأمثال حكمة القرون المتعاقبة.' },
        ],
        readingParagraph: {
          title: isLevel5 ? 'عمق الكلمة الروسية' : 'استراتيجية التمكّن اللغوي',
          text: isLevel5
            ? 'Подлинное владение языком начинается тогда, когда человек мыслит его образами, улавливает тончайшие оттенки интонации и свободно строит выразительные периоды.'
            : 'Несмотря на сложность падежной системы, последовательное погружение в аутентичные тексты позволяет развить интуитивное чувство языка.',
          translation: isLevel5
            ? 'يبدأ الامتلاك الحقيقي للغة حين يفكر المرء بصورها البلاغية، ويلتقط أدق ظلال النبرة، ويبني عبارات معبّرة بسلاسة.'
            : 'على الرغم من تعقيد نظام الحالات الإعرابية، فإن الانغماس المنهجي في النصوص الأصيلة ينمّي الحس اللغوي الحدسي.',
          keyWords: isLevel5 ? ['Подлинное', 'оттенки', 'интонации'] : ['погружение', 'аутентичные', 'интуитивное'],
        },
      },
    ],
    exercises: {
      wordWriting: [
        {
          word: 'Последовательность',
          pronunciation: 'باسليدوفاتيلنوست',
          meaning: 'الاستمرارية / الاتساق المنهجي',
          explanation: 'مصدر مشتق من "بعد" (после)، ويُشير إلى الالتزام المتواصل بخطوات متسلسلة حتى الإتقان.',
          example: 'Последовательность в обучении даёт блестящий результат.',
          exampleTranslation: 'الاستمرارية في التعلم تعطي نتائج باهرة.',
        },
        {
          word: 'Красноречие',
          pronunciation: 'كراسناريتشيي',
          meaning: 'الفصاحة والبلاغة',
          explanation: 'كلمة مركبة من "красный" (بمعناها القديم: جميل) و"речь" (خطاب/كلام)، أي جمال القول وفصاحته.',
          example: 'Искусство красноречия ценилось во все времена.',
          exampleTranslation: 'لطالما حظي فن البلاغة بالتقدير عبر العصور.',
        },
      ],
      writing: [
        {
          prompt: 'اكتب بالروسية: الاستمرارية هي أساس الإتقان الحقيقي.',
          expected: 'Последовательность — основа подлинного мастерства.',
          hint: 'Последовательность — основа...',
        },
        {
          prompt: 'اكتب بالروسية: قدّم الباحث حجة مقنعة خلال المناظرة.',
          expected: 'Исследователь привёл убедительный аргумент во время дискуссии.',
          hint: 'убедительный аргумент',
        },
      ],
      speaking: [
        {
          phrase: 'Подлинное владение языком требует вдумчивого чтения.',
          phonetic: 'بودلينوي فلادينيي يازيكوم تريبويت فدومتشيفافو تشتينيا',
          translation: 'الإتقان الحقيقي للغة يتطلب قراءة متعمقة.',
        },
        {
          phrase: 'Век живи — век учись.',
          phonetic: 'فيك جيفي — فيك أوتشيس',
          translation: 'عِشْ دهراً وتعلّم دهراً (مثل روسي مأثور).',
        },
      ],
      fillBlanks: [
        { before: 'Она представила весьма', after: 'аргумент в пользу проекта.', options: ['убедительный', 'сладкий', 'холодный', 'пустой'], correct: 'убедительный', translation: 'قدّمت حجة مقنعة للغاية لصالح المشروع.' },
        { before: 'Погружение в литературу расширяет', after: 'читателя.', options: ['мировоззрение', 'билет', 'вокзал', 'чай'], correct: 'мировоззрение', translation: 'الانغماس في الأدب يوسّع آفاق القارئ.' },
        { before: '', after: '— залог долгосрочного успеха.', options: ['Последовательность', 'Ошибка', 'Вода', 'Улица'], correct: 'Последовательность', translation: 'الاستمرارية هي ضمان النجاح طويل الأمد.' },
      ],
      matching: [
        { target: 'Мировоззрение', native: 'رؤية فكرية', pronunciation: 'ميروفوزرينيي' },
        { target: 'Убедительный', native: 'مقنع', pronunciation: 'أوبيديتيلني' },
        { target: 'Последовательность', native: 'استمرارية منهجية', pronunciation: 'باسليدوفاتيلنوست' },
        { target: 'Красноречие', native: 'بلاغة وفصاحة', pronunciation: 'كراسناريتشيي' },
        { target: 'Подлинный', native: 'أصيل / حقيقي', pronunciation: 'بودليني' },
      ],
      reading: {
        title: 'آفاق الفكر واللغة',
        paragraph: 'Подлинное владение языком начинается тогда, когда человек мыслит его образами, улавливает тончайшие оттенки интонации и свободно строит выразительные периоды.',
        translation: 'يبدأ الامتلاك الحقيقي للغة حين يفكر المرء بصورها البلاغية، ويلتقط أدق ظلال النبرة، ويبني عبارات معبّرة بسلاسة.',
        question: 'متى يتحقق الامتلاك الحقيقي للغة حسب النص؟',
        options: ['عندما يفكر المتحدث بصورها ويلتقط أدق ظلال النبرة', 'عند حفظ عشر كلمات فقط', 'عند تجنب النصوص الأدبية'],
        correctIndex: 0,
      },
    },
  };
}

function buildRussianSprint(level: number): InteractiveSprintStep[] {
  if (level === 1) {
    return [
      {
        id: 'ru-s1',
        type: 'arrange',
        prompt: 'رتّب الكلمات الروسية لتكوين: مرحباً، اسمي طارق',
        targetSentence: 'Привет меня зовут Тарик',
        tiles: ['Тарик', 'Привет', 'вода', 'зовут', 'меня', 'книга'],
      },
      {
        id: 'ru-s2',
        type: 'listen',
        prompt: 'استمع للعبارة الروسية ثم اختر معناها الصحيح',
        audioText: 'Доброе утро, как дела?',
        options: ['صباح الخير، كيف الحال؟', 'أين محطة القطار؟', 'شكراً جزيلاً على الكتاب', 'مع السلامة، أراك غداً'],
        correctIndex: 0,
      },
      {
        id: 'ru-s3',
        type: 'choice',
        prompt: 'كيف تقول "شكراً جزيلاً" بالروسية؟',
        audioText: 'Большое спасибо',
        options: ['Большое спасибо', 'Доброе утро', 'Мой друг', 'Книга и вода'],
        correctIndex: 0,
      },
      {
        id: 'ru-s4',
        type: 'arrange',
        prompt: 'رتّب الكلمات الروسية لتكوين: صباح الخير يا صديقي',
        targetSentence: 'Доброе утро мой друг',
        tiles: ['друг', 'Доброе', 'чай', 'мой', 'утро', 'дом'],
      },
    ];
  }
  if (level === 2) {
    return [
      {
        id: 'ru-l2-s1',
        type: 'arrange',
        prompt: 'رتّب الكلمات الروسية لتكوين: اليوم أنا ذاهب إلى المتجر',
        targetSentence: 'Сегодня я иду в магазин',
        tiles: ['магазин', 'Сегодня', 'в', 'я', 'иду', 'билет'],
      },
      {
        id: 'ru-l2-s2',
        type: 'listen',
        prompt: 'استمع واختر المعنى الصحيح بالروسية',
        audioText: 'Сколько стоит этот билет?',
        options: ['كم سعر هذه التذكرة؟', 'أين يقع منزلك؟', 'أشرب الشاي كل صباح', 'اسمي طارق'],
        correctIndex: 0,
      },
      {
        id: 'ru-l2-s3',
        type: 'choice',
        prompt: 'كيف تسأل "أين تقع محطة القطار؟" بالروسية؟',
        audioText: 'Где находится вокзал?',
        options: ['Где находится вокзал?', 'Большое спасибо', 'Всё хорошо', 'До завтра'],
        correctIndex: 0,
      },
    ];
  }
  return [
    {
      id: 'ru-adv-s1',
      type: 'arrange',
      prompt: 'رتّب الكلمات الروسية لتكوين: الاستمرارية هي ضمان النجاح',
      targetSentence: 'Последовательность это залог успеха',
      tiles: ['успеха', 'Последовательность', 'залог', 'это', 'книга', 'метро'],
    },
    {
      id: 'ru-adv-s2',
      type: 'listen',
      prompt: 'استمع للعبارة الروسية واختر معناها الأدق',
      audioText: 'По моему мнению, практика ведёт к успеху',
      options: ['في رأيي، الممارسة تقود إلى النجاح', 'المتجر مفتوح حتى المساء', 'أحتاج كوب ماء من فضلك', 'الأمس كان يوماً بارداً'],
      correctIndex: 0,
    },
    {
      id: 'ru-adv-s3',
      type: 'choice',
      prompt: 'ما معنى الكلمة الروسية "Мировоззрение"؟',
      audioText: 'Мировоззрение',
      options: ['رؤية فكرية وفلسفة حياة', 'محطة قطار سريعة', 'تذكرة سفر دولية', 'كوب شاي ساخن'],
      correctIndex: 0,
    },
  ];
}

/* ============================================================================
   2. ENGLISH (الإنجليزية) — Levels 1..5
   ============================================================================ */
function buildEnglishStarter(level: number): StarterContent {
  if (level === 1) {
    return {
      lessons: [
        {
          id: 'en-l1-greetings',
          title: 'الدرس 1: التحيات والتعارف الأساسي (مستوى مبتدئ)',
          summary: 'تعلّم كيف تحيّي الآخرين وتعرّف بنفسك بثقة في المواقف اليومية الأولى.',
          grammarTip: 'في الإنجليزية نستخدم فعل الكينونة "am" بعد "I" للتعريف بالاسم أو الحالة، مثل: I am Ali.',
          culturalNote: 'يُعد قول "How are you?" في الإنجليزية تحية ودّية سريعة وغالباً ما يُرد عليها بـ "I am good, thank you".',
          level: 1,
          vocabulary: [
            { word: 'Hello', pronunciation: 'هيلو', translation: 'مرحباً', example: 'Hello, my name is Omar.', exampleTranslation: 'مرحباً، اسمي عمر.' },
            { word: 'Good morning', pronunciation: 'غود مورنينغ', translation: 'صباح الخير', example: 'Good morning, how are you?', exampleTranslation: 'صباح الخير، كيف حالك؟' },
            { word: 'Thank you', pronunciation: 'ثانك يو', translation: 'شكراً لك', example: 'Thank you very much.', exampleTranslation: 'شكراً جزيلاً لك.' },
            { word: 'Please', pronunciation: 'بليز', translation: 'من فضلك', example: 'Water, please.', exampleTranslation: 'ماء، من فضلك.' },
            { word: 'Goodbye', pronunciation: 'غودباي', translation: 'مع السلامة', example: 'Goodbye, see you tomorrow.', exampleTranslation: 'مع السلامة، أراك غداً.' },
          ],
          dialogues: [
            { speaker: 'سارة', line: 'Hello! Nice to meet you.', translation: 'مرحباً! سررت بلقائك.' },
            { speaker: 'كريم', line: 'Nice to meet you too. What is your name?', translation: 'وأنا أيضاً سررت بلقائك. ما اسمك؟' },
            { speaker: 'سارة', line: 'My name is Sara. I am from Cairo.', translation: 'اسمي سارة. أنا من القاهرة.' },
          ],
          readingParagraph: {
            title: 'بداية يوم جديد',
            text: 'Hello! My name is Tariq. Every morning I drink coffee and read one simple book. I love learning new words.',
            translation: 'مرحباً! اسمي طارق. كل صباح أشرب القهوة وأقرأ كتاباً بسيطاً. أحب تعلم كلمات جديدة.',
            keyWords: ['morning', 'coffee', 'simple', 'learning'],
          },
        },
      ],
      exercises: {
        wordWriting: [
          { word: 'Hello', pronunciation: 'هيلو', meaning: 'مرحباً', explanation: 'أشهر تحية إنجليزية تُستخدم في كل الأوقات، رسمية كانت أو ودية.', example: 'Hello, nice to meet you.', exampleTranslation: 'مرحباً، سررت بلقائك.' },
          { word: 'Water', pronunciation: 'ووتر', meaning: 'ماء', explanation: 'اسم غير معدود في الإنجليزية، حرف W يُنطق واواً واضحة.', example: 'A glass of water, please.', exampleTranslation: 'كوب ماء، من فضلك.' },
          { word: 'Friend', pronunciation: 'فريند', meaning: 'صديق', explanation: 'لاحظ أن حرف i بعد e لا يُنطق هنا، وتُلفظ الكلمة "فريند".', example: 'He is my close friend.', exampleTranslation: 'هو صديقي المقرب.' },
        ],
        writing: [
          { prompt: 'اكتب بالإنجليزية: مرحباً، اسمي علي.', expected: 'Hello, my name is Ali.', hint: 'ابدأ بـ Hello ثم my name is...' },
          { prompt: 'اكتب بالإنجليزية: شكراً جزيلاً لك.', expected: 'Thank you very much.', hint: 'استخدم Thank you + very much' },
        ],
        speaking: [
          { phrase: 'Hello, nice to meet you.', phonetic: 'هيلو، نايس تو ميت يو', translation: 'مرحباً، سررت بلقائك.' },
          { phrase: 'Good morning, how are you today?', phonetic: 'غود مورنينغ، هاو آر يو توداي', translation: 'صباح الخير، كيف حالك اليوم؟' },
        ],
        fillBlanks: [
          { before: 'Good', after: ', my friend!', options: ['morning', 'table', 'water', 'blue'], correct: 'morning', translation: 'صباح الخير يا صديقي!' },
          { before: 'I', after: 'from Morocco.', options: ['am', 'is', 'are', 'be'], correct: 'am', translation: 'أنا من المغرب.' },
          { before: 'Thank you very', after: '.', options: ['much', 'many', 'name', 'time'], correct: 'much', translation: 'شكراً جزيلاً لك.' },
        ],
        matching: [
          { target: 'Hello', native: 'مرحباً', pronunciation: 'هيلو' },
          { target: 'Thank you', native: 'شكراً لك', pronunciation: 'ثانك يو' },
          { target: 'Morning', native: 'الصباح', pronunciation: 'مورنينغ' },
          { target: 'Friend', native: 'صديق', pronunciation: 'فريند' },
          { target: 'Water', native: 'ماء', pronunciation: 'ووتر' },
        ],
        reading: {
          title: 'صباح نشيط',
          paragraph: 'Hello! My name is Tariq. Every morning I drink coffee and read one simple book. I love learning new words with my friend.',
          translation: 'مرحباً! اسمي طارق. كل صباح أشرب القهوة وأقرأ كتاباً بسيطاً. أحب تعلم كلمات جديدة مع صديقي.',
          question: 'ماذا يفعل طارق كل صباح؟',
          options: ['يشرب القهوة ويقرأ كتاباً بسيطاً', 'يسافر بالقطار', 'ينام حتى الظهر'],
          correctIndex: 0,
        },
      },
    };
  }

  if (level === 2) {
    return {
      lessons: [
        {
          id: 'en-l2-daily',
          title: 'الدرس 1: الروتين اليومي والتنقل (اعرف بعض الكلمات)',
          summary: 'ربط المفردات في جمل عملية للتحدث عن يومك والمواصلات.',
          grammarTip: 'نستخدم المضارع البسيط للحديث عن العادات المتكررة، ونضيف -s للفعل مع he/she.',
          culturalNote: 'كلمة "Commute" شائعة لوصف رحلة الذهاب والعودة من العمل.',
          level: 2,
          vocabulary: [
            { word: 'Usually', pronunciation: 'يوژوالي', translation: 'عادةً', example: 'I usually wake up at seven.', exampleTranslation: 'أستيقظ عادةً في السابعة.' },
            { word: 'Station', pronunciation: 'ستيشن', translation: 'محطة', example: 'The train station is nearby.', exampleTranslation: 'محطة القطار قريبة.' },
            { word: 'Order', pronunciation: 'أوردر', translation: 'يطلب', example: 'I would like to order tea.', exampleTranslation: 'أود أن أطلب شاياً.' },
            { word: 'Schedule', pronunciation: 'سكيدجول', translation: 'جدول مواعيد', example: 'My schedule is busy today.', exampleTranslation: 'جدولي مزدحم اليوم.' },
          ],
          dialogues: [
            { speaker: 'ناديا', line: 'How do you go to work every day?', translation: 'كيف تذهب إلى العمل كل يوم؟' },
            { speaker: 'سامي', line: 'I usually take the train because it is fast.', translation: 'عادةً أستقل القطار لأنه سريع.' },
          ],
          readingParagraph: {
            title: 'رحلة الصباح',
            text: 'Samia leaves her house at eight every morning. She walks to the station, buys a cup of tea, and reviews twenty new words on the train.',
            translation: 'تغادر سامية منزلها في الثامنة كل صباح. تمشي إلى المحطة وتشتري كوب شاي وتراجع عشرين كلمة جديدة في القطار.',
            keyWords: ['leaves', 'station', 'reviews', 'train'],
          },
        },
      ],
      exercises: {
        wordWriting: [
          { word: 'Schedule', pronunciation: 'سكيدجول', meaning: 'جدول مواعيد', explanation: 'يُشير إلى خطة الأوقات اليومية أو جدول الرحلات والمحاضرات.', example: 'Let me check my schedule.', exampleTranslation: 'دعني أراجع جدولي.' },
          { word: 'Station', pronunciation: 'ستيشن', meaning: 'محطة', explanation: 'المقطع -tion في الإنجليزية يُنطق دائماً "شِن".', example: 'The bus station is on the left.', exampleTranslation: 'محطة الحافلات على اليسار.' },
        ],
        writing: [
          { prompt: 'اكتب بالإنجليزية: أستيقظ عادةً في الساعة السابعة.', expected: 'I usually wake up at seven.', hint: 'استخدم usually قبل wake up' },
          { prompt: 'اكتب بالإنجليزية: أود أن أطلب كوباً من الشاي.', expected: 'I would like to order a cup of tea.', hint: 'ابدأ بـ I would like to...' },
        ],
        speaking: [
          { phrase: 'I usually take the train to work.', phonetic: 'آي يوژوالي تيك ذا ترين تو وورك', translation: 'عادةً أستقل القطار إلى العمل.' },
          { phrase: 'Where is the nearest bus station?', phonetic: 'وير إز ذا نيرست باص ستيشن', translation: 'أين أقرب محطة حافلات؟' },
        ],
        fillBlanks: [
          { before: 'She', after: 'to the station every morning.', options: ['walks', 'walk', 'walking', 'walked'], correct: 'walks', translation: 'هي تمشي إلى المحطة كل صباح.' },
          { before: 'My schedule is very', after: 'today.', options: ['busy', 'tea', 'train', 'cup'], correct: 'busy', translation: 'جدولي مزدحم جداً اليوم.' },
        ],
        matching: [
          { target: 'Usually', native: 'عادةً', pronunciation: 'يوژوالي' },
          { target: 'Station', native: 'محطة', pronunciation: 'ستيشن' },
          { target: 'Schedule', native: 'جدول مواعيد', pronunciation: 'سكيدجول' },
          { target: 'Nearby', native: 'قريب', pronunciation: 'نيرباي' },
          { target: 'Fast', native: 'سريع', pronunciation: 'فاست' },
        ],
        reading: {
          title: 'التعلم في الطريق',
          paragraph: 'Samia leaves her house at eight every morning. She walks to the station, buys a cup of tea, and reviews twenty new words on the train.',
          translation: 'تغادر سامية منزلها في الثامنة كل صباح وتراجع عشرين كلمة جديدة في القطار.',
          question: 'كيف تستغل سامية وقتها في القطار؟',
          options: ['تراجع عشرين كلمة جديدة', 'تشاهد التلفاز', 'تتصل بمديرها'],
          correctIndex: 0,
        },
      },
    };
  }

  const isHigh = level >= 4;
  return {
    lessons: [
      {
        id: `en-l${level}-fluency`,
        title: isHigh
          ? `الدرس 1: البلاغة وصياغة الحجج المقنعة (مستوى ${level === 5 ? 'ممتاز' : 'متقدم'})`
          : 'الدرس 1: سرد التجارب وإبداء الرأي بطلاقة (مستوى متوسط)',
        summary: isHigh
          ? 'استخدام التراكيب الدقيقة، الروابط المنطقية، والتعابير الاصطلاحية في السياقات الرفيعة.'
          : 'تعلّم كيف تربط أفكارك باستخدام روابط السبب والنتيجة والتحدث عن خبراتك.',
        grammarTip: isHigh
          ? 'تساعد الجمل المقلوبة مثل "Not only did we achieve..." في إضفاء وزن بلاغي قوي.'
          : 'استخدم المضارع التام (have/has + V3) لربط التجارب الماضية بالحاضر.',
        culturalNote: 'تُفضَّل عبارات التهذيب مثل "From another perspective" قبل طرح الرأي المخالف.',
        level,
        vocabulary: [
          { word: 'Perspective', pronunciation: 'بيرسبيكتيف', translation: 'منظور / وجهة نظر', example: 'Let us examine this from a broader perspective.', exampleTranslation: 'دعنا نبحث هذا من منظور أوسع.' },
          { word: 'Consistent', pronunciation: 'كونسيستنت', translation: 'مستمر / متسق', example: 'Consistent practice leads to lasting fluency.', exampleTranslation: 'الممارسة المستمرة تقود إلى طلاقة دائمة.' },
          { word: 'Articulate', pronunciation: 'آرتيكيوليت', translation: 'يعبّر بوضوح وفصاحة', example: 'She articulated her vision with clarity.', exampleTranslation: 'عبّرت عن رؤيتها بوضوح لافت.' },
        ],
        dialogues: [
          { speaker: 'المدربة', line: 'What strategy helped you overcome hesitation?', translation: 'ما الاستراتيجية التي ساعدتك على تجاوز التردد؟' },
          { speaker: 'المتعلم', line: 'Shadowing native speakers daily gave me real confidence.', translation: 'الترديد الصوتي اليومي منحني ثقة حقيقية.' },
        ],
        readingParagraph: {
          title: 'قوة الانغماس اللغوي الواعي',
          text: 'Achieving genuine fluency rarely happens overnight. Rather, it emerges from consistent daily exposure and the courage to articulate complex ideas.',
          translation: 'نادراً ما يتحقق الإتقان الحقيقي بين عشية وضحاها؛ بل ينبثق من التعرض اليومي المستمر والشجاعة في التعبير عن الأفكار المركبة.',
          keyWords: ['genuine', 'consistent', 'articulate'],
        },
      },
    ],
    exercises: {
      wordWriting: [
        { word: 'Perspective', pronunciation: 'بيرسبيكتيف', meaning: 'وجهة نظر / منظور', explanation: 'مشتقة من الجذر اللاتيني للرؤية، وتعني الزاوية التي ننظر منها لموضوع أو فكرة.', example: 'That gave me a fresh perspective.', exampleTranslation: 'منحني ذلك منظوراً جديداً.' },
        { word: 'Consistent', pronunciation: 'كونسيستنت', meaning: 'مستمر / متسق', explanation: 'تصف الالتزام المنتظم دون انقطاع في الدراسة أو العمل.', example: 'Consistent effort wins.', exampleTranslation: 'الجهد المستمر ينتصر.' },
      ],
      writing: [
        { prompt: 'اكتب بالإنجليزية: الممارسة المستمرة هي المفتاح الحقيقي لإتقان أي لغة.', expected: 'Consistent practice is the true key to mastering any language.', hint: 'Consistent practice + key to mastering' },
        { prompt: 'اكتب بالإنجليزية: من وجهة نظري، الاستماع اليومي يصنع فرقاً كبيراً.', expected: 'From my perspective, daily listening makes a significant difference.', hint: 'From my perspective...' },
      ],
      speaking: [
        { phrase: 'Consistent practice builds confidence and natural fluency.', phonetic: 'كونسيستنت براكتس بيلدز كونفيدنس آند ناتشورال فلوينسي', translation: 'الممارسة المستمرة تبني الثقة والطلاقة الطبيعية.' },
      ],
      fillBlanks: [
        { before: 'Achieving fluency requires', after: 'daily effort.', options: ['consistent', 'sleeping', 'random', 'absent'], correct: 'consistent', translation: 'تحقيق الطلاقة يتطلب جهداً يومياً مستمراً.' },
        { before: 'She managed to', after: 'her proposal clearly.', options: ['articulate', 'forget', 'hide', 'delay'], correct: 'articulate', translation: 'تمكنت من صياغة مقترحها بوضوح.' },
      ],
      matching: [
        { target: 'Perspective', native: 'منظور', pronunciation: 'بيرسبيكتيف' },
        { target: 'Consistent', native: 'مستمر', pronunciation: 'كونسيستنت' },
        { target: 'Milestone', native: 'إنجاز فارق', pronunciation: 'مايلستون' },
        { target: 'Articulate', native: 'يفصح بوضوح', pronunciation: 'آرتيكيوليت' },
        { target: 'Deliberate', native: 'مدروس', pronunciation: 'ديليبريت' },
      ],
      reading: {
        title: 'الانغماس اللغوي',
        paragraph: 'Achieving genuine fluency rarely happens overnight. Rather, it emerges from consistent daily exposure and the courage to articulate complex ideas.',
        translation: 'نادراً ما يتحقق الإتقان الحقيقي بين عشية وضحاها بل ينبثق من التعرض اليومي المستمر.',
        question: 'ما العامل الأساسي الذي تنبثق منه الطلاقة حسب الفقرة؟',
        options: ['التعرض اليومي المستمر والشجاعة في التعبير', 'حفظ القاموس دفعة واحدة', 'تجنب التحدث'],
        correctIndex: 0,
      },
    },
  };
}

function buildEnglishSprint(level: number): InteractiveSprintStep[] {
  if (level >= 3) {
    return [
      {
        id: 'en-h1',
        type: 'arrange',
        prompt: 'رتّب الكلمات لتكوين: الممارسة المستمرة تبني الطلاقة الطبيعية',
        targetSentence: 'Consistent practice builds natural fluency',
        tiles: ['fluency', 'Consistent', 'coffee', 'builds', 'practice', 'natural', 'yesterday'],
      },
      {
        id: 'en-h2',
        type: 'listen',
        prompt: 'استمع للعبارة واختر الترجمة الأدق',
        audioText: 'Let us examine this from a broader perspective',
        options: ['دعنا نبحث هذا من منظور أوسع', 'القطار يصل في الثامنة', 'أحتاج لحجز غرفة', 'أين محطة المترو؟'],
        correctIndex: 0,
      },
    ];
  }
  return [
    {
      id: 'en-b1',
      type: 'arrange',
      prompt: 'رتّب الكلمات لتكوين: مرحباً، اسمي طارق',
      targetSentence: 'Hello my name is Tariq',
      tiles: ['Tariq', 'Hello', 'water', 'name', 'is', 'my', 'book'],
    },
    {
      id: 'en-b2',
      type: 'listen',
      prompt: 'استمع جيداً ثم اختر المعنى الصحيح',
      audioText: 'Good morning, how are you today?',
      options: ['صباح الخير، كيف حالك اليوم؟', 'مع السلامة، أراك غداً', 'أريد كوباً من الماء', 'اسمي سارة'],
      correctIndex: 0,
    },
    {
      id: 'en-b3',
      type: 'choice',
      prompt: 'كيف تقول "شكراً جزيلاً لك" بالإنجليزية؟',
      audioText: 'Thank you very much',
      options: ['Thank you very much', 'Good morning', 'See you tomorrow', 'My best friend'],
      correctIndex: 0,
    },
  ];
}

/* ============================================================================
   3. MULTILINGUAL PACKS (FR, ES, DE, TR, IT, JA, KO, ZH, AR) — Pure & Levelled
   ============================================================================ */
interface QuickLangSeed {
  lessons: Record<1 | 2 | 3, { title: string; summary: string; tip: string; culture: string; vocab: { w: string; p: string; t: string; ex: string; ext: string }[]; dialogue: { s: string; l: string; t: string }[]; paraTitle: string; para: string; paraTr: string; keys: string[] }>;
  wordWriting: WordWritingItem[];
  writing: { prompt: string; expected: string; hint: string }[];
  speaking: { phrase: string; phonetic: string; translation: string }[];
  fillBlanks: { before: string; after: string; options: string[]; correct: string; translation: string }[];
  matching: { target: string; native: string; pronunciation: string }[];
  readingQ: { q: string; opts: string[]; ans: number };
  sprint: InteractiveSprintStep[];
}

function packFromSeed(langCode: string, level: number, seed: QuickLangSeed): StarterContent {
  const tier: 1 | 2 | 3 = level === 1 ? 1 : level === 2 ? 2 : 3;
  const L = seed.lessons[tier];
  return {
    lessons: [
      {
        id: `${langCode}-l${level}-main`,
        title: `${L.title} (المستوى ${level})`,
        summary: L.summary,
        grammarTip: L.tip,
        culturalNote: L.culture,
        level,
        vocabulary: L.vocab.map((v) => ({
          word: v.w,
          pronunciation: v.p,
          translation: v.t,
          example: v.ex,
          exampleTranslation: v.ext,
        })),
        dialogues: L.dialogue.map((d) => ({ speaker: d.s, line: d.l, translation: d.t })),
        readingParagraph: {
          title: L.paraTitle,
          text: L.para,
          translation: L.paraTr,
          keyWords: L.keys,
        },
      },
    ],
    exercises: {
      wordWriting: seed.wordWriting,
      writing: seed.writing,
      speaking: seed.speaking,
      fillBlanks: seed.fillBlanks,
      matching: seed.matching,
      reading: {
        title: L.paraTitle,
        paragraph: L.para,
        translation: L.paraTr,
        question: seed.readingQ.q,
        options: seed.readingQ.opts,
        correctIndex: seed.readingQ.ans,
      },
    },
  };
}

const SEEDS: Record<string, QuickLangSeed> = {
  الفرنسية: {
    lessons: {
      1: {
        title: 'الدرس 1: التحيات والنطق الفرنسي الأساسي',
        summary: 'التحيات المهذبة وبناء جمل التعارف الأولى بالفرنسية.',
        tip: 'استخدم "Vous" للاحترام و"Tu" مع الأصدقاء، وكثيراً ما تسقط نطق الحرف الساكن الأخير.',
        culture: 'يبدأ المتحدثون بالفرنسية أي حديث مهذب بـ "Bonjour".',
        vocab: [
          { w: 'Bonjour', p: 'بونجور', t: 'مرحباً / صباح الخير', ex: 'Bonjour, je m’appelle Tariq.', ext: 'مرحباً، اسمي طارق.' },
          { w: 'Merci beaucoup', p: 'ميرسي بوكو', t: 'شكراً جزيلاً', ex: 'Merci beaucoup pour votre aide.', ext: 'شكراً جزيلاً لمساعدتكم.' },
          { w: 'S’il vous plaît', p: 'سيل فو بليه', t: 'من فضلك', ex: 'Un café, s’il vous plaît.', ext: 'قهوة، من فضلك.' },
          { w: 'Eau', p: 'أو', t: 'ماء', ex: 'De l’eau, s’il vous plaît.', ext: 'ماء، من فضلك.' },
        ],
        dialogue: [
          { s: 'لينا', l: 'Bonjour ! Je m’appelle Lina.', t: 'مرحباً! اسمي لينا.' },
          { s: 'بول', l: 'Bonjour Lina, enchanté !', t: 'مرحباً لينا، تشرفت بك!' },
        ],
        paraTitle: 'صباح في باريس',
        para: 'Bonjour ! Aujourd’hui, je vais au café avec mon ami. Nous parlons français ensemble.',
        paraTr: 'مرحباً! اليوم أذهب إلى المقهى مع صديقي. نتحدث الفرنسية معاً.',
        keys: ['Bonjour', 'café', 'français'],
      },
      2: {
        title: 'الدرس 1: المقهى والتنقل بالفرنسية',
        summary: 'الطلب في المطعم والسؤال عن الاتجاهات ووسائل النقل.',
        tip: 'للسؤال عن المكان نستخدم: "Où est..." متبوعاً بالمكان.',
        culture: 'إضافة "Excusez-moi" قبل أي سؤال يُظهر لباقة عالية.',
        vocab: [
          { w: 'Gare', p: 'غار', t: 'محطة القطار', ex: 'Où est la gare ?', ext: 'أين محطة القطار؟' },
          { w: 'Billet', p: 'بييه', t: 'تذكرة', ex: 'Je voudrais un billet.', ext: 'أريد تذكرة.' },
          { w: 'Aujourd’hui', p: 'أوجوردوي', t: 'اليوم', ex: 'Aujourd’hui je voyage.', ext: 'اليوم أسافر.' },
        ],
        dialogue: [
          { s: 'كريم', l: 'Excusez-moi, où est la gare ?', t: 'عفواً، أين محطة القطار؟' },
          { s: 'ماري', l: 'Tout droit puis à gauche.', t: 'مباشرة للأمام ثم إلى اليسار.' },
        ],
        paraTitle: 'رحلة القطار',
        para: 'Ce matin, je prends le train à la gare centrale. Je lis un livre français pendant le voyage.',
        paraTr: 'هذا الصباح أستقل القطار من المحطة المركزية وأقرأ كتاباً فرنسياً.',
        keys: ['train', 'gare', 'voyage'],
      },
      3: {
        title: 'الدرس 1: التعبير عن الرأي والبلاغة الفرنسية',
        summary: 'صياغة الآراء الدقيقة والروابط المنطقية المتقدمة بالفرنسية.',
        tip: 'عبارات مثل "À mon avis" و"Bien que" تضفي رصانة وأسلوباً راقياً على حديثك.',
        culture: 'يُقدّر الفرنسيون النقاش المنطقي الهادئ وتوضيح الأسباب.',
        vocab: [
          { w: 'Perspective', p: 'بيرسبكتيف', t: 'منظور', ex: 'C’est une nouvelle perspective.', ext: 'هذا منظور جديد.' },
          { w: 'Maîtrise', p: 'ميتريز', t: 'إتقان', ex: 'La pratique mène à la maîtrise.', ext: 'الممارسة تقود إلى الإتقان.' },
          { w: 'Convaincant', p: 'كونفانكان', t: 'مقنع', ex: 'Un argument très convaincant.', ext: 'حجة مقنعة جداً.' },
        ],
        dialogue: [
          { s: 'أستاذ', l: 'Quel est le secret de la fluidité ?', t: 'ما سر الطلاقة؟' },
          { s: 'طالبة', l: 'À mon avis, la régularité quotidienne est essentielle.', t: 'في رأيي، الانتظام اليومي هو الأساس.' },
        ],
        paraTitle: 'إتقان الفرنسية',
        para: 'La maîtrise d’une langue repose sur la patience, l’écoute attentive et le plaisir de découvrir une nouvelle culture.',
        paraTr: 'يرتكز إتقان اللغة على الصبر والاستماع الواعي ومتعة اكتشاف ثقافة جديدة.',
        keys: ['maîtrise', 'patience', 'culture'],
      },
    },
    wordWriting: [
      { word: 'Bonjour', pronunciation: 'بونجور', meaning: 'صباح الخير / مرحباً', explanation: 'كلمة مركبة من Bon (جيد) + Jour (يوم)، وهي التحية الأساسية بالفرنسية.', example: 'Bonjour madame.', exampleTranslation: 'صباح الخير سيدتي.' },
      { word: 'Merci', pronunciation: 'ميرسي', meaning: 'شكراً', explanation: 'كلمة الشكر الأساسية، وحرف c قبل i يُنطق سيناً.', example: 'Merci beaucoup !', exampleTranslation: 'شكراً جزيلاً!' },
    ],
    writing: [
      { prompt: 'اكتب بالفرنسية: مرحباً، شكراً جزيلاً.', expected: 'Bonjour, merci beaucoup.', hint: 'Bonjour + merci beaucoup' },
      { prompt: 'اكتب بالفرنسية: قهوة، من فضلك.', expected: 'Un café, s’il vous plaît.', hint: 's’il vous plaît' },
    ],
    speaking: [
      { phrase: 'Bonjour, comment allez-vous ?', phonetic: 'بونجور، كومون تاليه فو', translation: 'مرحباً، كيف حالك؟' },
      { phrase: 'Merci beaucoup, bonne journée !', phonetic: 'ميرسي بوكو، بون جورنيه', translation: 'شكراً جزيلاً، يوم سعيد!' },
    ],
    fillBlanks: [
      { before: '', after: ', comment ça va ?', options: ['Bonjour', 'Merci', 'Café', 'Ami'], correct: 'Bonjour', translation: 'مرحباً، كيف الحال؟' },
      { before: 'Un thé, s’il vous', after: '.', options: ['plaît', 'merci', 'matin', 'jour'], correct: 'plaît', translation: 'شاي، من فضلك.' },
    ],
    matching: [
      { target: 'Bonjour', native: 'مرحباً', pronunciation: 'بونجور' },
      { target: 'Merci', native: 'شكراً', pronunciation: 'ميرسي' },
      { target: 'Ami', native: 'صديق', pronunciation: 'أمي' },
      { target: 'Café', native: 'قهوة', pronunciation: 'كافيه' },
      { target: 'Demain', native: 'غداً', pronunciation: 'دومان' },
    ],
    readingQ: { q: 'ما موضوع الفقرة الرئيسي؟', opts: ['التعلم والممارسة بالفرنسية', 'إصلاح السيارات', 'الطقس فقط'], ans: 0 },
    sprint: [
      { id: 'fr-s1', type: 'arrange', prompt: 'رتّب الكلمات لتكوين: صباح الخير، كيف حالك؟', targetSentence: 'Bonjour comment allez vous', tiles: ['vous', 'Bonjour', 'merci', 'allez', 'comment', 'café'] },
      { id: 'fr-s2', type: 'listen', prompt: 'استمع جيداً ثم اختر المعنى الصحيح', audioText: 'Un café, s’il vous plaît', options: ['قهوة، من فضلك', 'أين محطة القطار؟', 'شكراً جزيلاً', 'أراك غداً'], correctIndex: 0 },
      { id: 'fr-s3', type: 'choice', prompt: 'ماذا تقول بالفرنسية لتقول "تشرفت بمعرفتك"؟', audioText: 'Enchanté', options: ['Enchanté', 'Demain', 'Au revoir', 'Bonjour'], correctIndex: 0 },
    ],
  },

  الإسبانية: {
    lessons: {
      1: {
        title: 'الدرس 1: أسس النطق والتحيات الإسبانية',
        summary: 'تحيات الحياة اليومية وقراءة الحروف الإسبانية بوضوح.',
        tip: 'حرف H صامت في الإسبانية مثل Hola (أولا)، وعلامتا الاستفهام تفتحان وتغلقان الجملة ¿...?.',
        culture: 'تتميز الإسبانية بنطق صوتي ثابت لكل حرف تقريباً.',
        vocab: [
          { w: 'Hola', p: 'أولا', t: 'مرحباً', ex: 'Hola, ¿cómo estás?', ext: 'مرحباً، كيف حالك؟' },
          { w: 'Gracias', p: 'غراثياس', t: 'شكراً', ex: 'Muchas gracias por todo.', ext: 'شكراً جزيلاً على كل شيء.' },
          { w: 'Por favor', p: 'بور فافور', t: 'من فضلك', ex: 'Agua, por favor.', ext: 'ماء، من فضلك.' },
          { w: 'Buenos días', p: 'بوينوس دياس', t: 'صباح الخير', ex: 'Buenos días, amigo.', ext: 'صباح الخير يا صديقي.' },
        ],
        dialogue: [
          { s: 'كارلوس', l: '¡Hola! ¿Cómo te llamas?', t: 'مرحباً! ما اسمك؟' },
          { s: 'نور', l: 'Me llamo Noor. ¡Mucho gusto!', t: 'اسمي نور. تشرفت بك!' },
        ],
        paraTitle: 'صباح في مدريد',
        para: 'Buenos días. Hoy practico español con mis amigos y aprendemos palabras nuevas cada día.',
        paraTr: 'صباح الخير. اليوم أتدرب على الإسبانية مع أصدقائي ونتعلم كلمات جديدة كل يوم.',
        keys: ['Buenos días', 'español', 'amigos'],
      },
      2: {
        title: 'الدرس 1: الطلب والتنقل بالإسبانية',
        summary: 'الطلب في المطعم والسؤال عن المواعيد والاتجاهات.',
        tip: 'استخدم "¿Dónde está...?" للسؤال عن مكان شيء معين.',
        culture: 'الأكل والتجمع في المطاعم جزء دافئ من الثقافة الإسبانية واللاتينية.',
        vocab: [
          { w: 'Estación', p: 'إستاثيون', t: 'محطة', ex: '¿Dónde está la estación?', ext: 'أين المحطة؟' },
          { w: 'Cuenta', p: 'كوينتا', t: 'الحساب', ex: 'La cuenta, por favor.', ext: 'الحساب، من فضلك.' },
          { w: 'Mañana', p: 'مانيانا', t: 'غداً / الصباح', ex: 'Hasta mañana.', ext: 'أراك غداً.' },
        ],
        dialogue: [
          { s: 'أحمد', l: 'Disculpe, ¿dónde está el museo?', t: 'عفواً، أين المتحف؟' },
          { s: 'لوسيا', l: 'Está cerca de la plaza.', t: 'إنه قريب من الساحة.' },
        ],
        paraTitle: 'في وسط المدينة',
        para: 'Cada tarde camino por la plaza, tomo un café con leche y converso en español.',
        paraTr: 'كل مساء أمشي في الساحة، وأتناول قهوة بالحليب وأتحادث بالإسبانية.',
        keys: ['tarde', 'plaza', 'café'],
      },
      3: {
        title: 'الدرس 1: إبداء الرأي والطلاقة الإسبانية',
        summary: 'ربط الجمل المعقدة ومناقشة الآراء بثقة.',
        tip: 'عبارة "En mi opinión" و"Sin embargo" ترفع مستوى تعبيرك فوراً.',
        culture: 'يُفضل التوازن بين اللباقة والحيوية أثناء الحوارات.',
        vocab: [
          { w: 'Opinión', p: 'أوبينيون', t: 'رأي', ex: 'En mi opinión, es fundamental.', ext: 'في رأيي، هذا جوهري.' },
          { w: 'Fluidez', p: 'فلويديث', t: 'طلاقة', ex: 'La lectura desarrolla la fluidez.', ext: 'القراءة تطوّر الطلاقة.' },
        ],
        dialogue: [
          { s: 'المدرب', l: '¿Qué te ayudó a mejorar tu español?', t: 'ما الذي ساعدك على تحسين لغتك؟' },
          { s: 'سارة', l: 'Escuchar podcasts y repetir en voz alta.', t: 'الاستماع للبودكاست والترديد بصوت عالٍ.' },
        ],
        paraTitle: 'طريق الطلاقة',
        para: 'Dominar el español exige constancia diaria, curiosidad cultural y diálogo frecuente.',
        paraTr: 'إتقان الإسبانية يتطلب ثباتاً يومياً وفضولاً ثقافياً وحواراً مستمراً.',
        keys: ['constancia', 'cultural', 'diálogo'],
      },
    },
    wordWriting: [
      { word: 'Hola', pronunciation: 'أولا', meaning: 'مرحباً', explanation: 'حرف H صامت تماماً في الإسبانية فلا يُنطق، وتُلفظ الكلمة "أولا".', example: '¡Hola, amigo!', exampleTranslation: 'مرحباً يا صديقي!' },
      { word: 'Gracias', pronunciation: 'غراثياس', meaning: 'شكراً', explanation: 'تُستخدم للشكر في كل المواقف، وتُضاف Muchas لتأكيد الامتنان.', example: 'Muchas gracias.', exampleTranslation: 'شكراً جزيلاً.' },
    ],
    writing: [
      { prompt: 'اكتب بالإسبانية: مرحباً، كيف حالك؟', expected: 'Hola, ¿cómo estás?', hint: 'Hola + ¿cómo estás?' },
      { prompt: 'اكتب بالإسبانية: شكراً جزيلاً.', expected: 'Muchas gracias.', hint: 'Muchas + gracias' },
    ],
    speaking: [
      { phrase: 'Hola, buenos días. ¿Cómo estás?', phonetic: 'أولا، بوينوس دياس، كومو إستاس', translation: 'مرحباً، صباح الخير. كيف حالك؟' },
      { phrase: 'Muchas gracias, hasta mañana.', phonetic: 'موتشاس غراثياس، أستا مانيانا', translation: 'شكراً جزيلاً، أراك غداً.' },
    ],
    fillBlanks: [
      { before: '¡', after: '! ¿Cómo te llamas?', options: ['Hola', 'Agua', 'Libro', 'Noche'], correct: 'Hola', translation: 'مرحباً! ما اسمك؟' },
      { before: 'Un café, por', after: '.', options: ['favor', 'días', 'gracias', 'amigo'], correct: 'favor', translation: 'قهوة، من فضلك.' },
    ],
    matching: [
      { target: 'Hola', native: 'مرحباً', pronunciation: 'أولا' },
      { target: 'Gracias', native: 'شكراً', pronunciation: 'غراثياس' },
      { target: 'Amigo', native: 'صديق', pronunciation: 'أميغو' },
      { target: 'Agua', native: 'ماء', pronunciation: 'أغوا' },
      { target: 'Mañana', native: 'غداً', pronunciation: 'مانيانا' },
    ],
    readingQ: { q: 'ما موضوع الفقرة؟', opts: ['ممارسة اللغة الإسبانية', 'السباحة', 'الطبخ'], ans: 0 },
    sprint: [
      { id: 'es-s1', type: 'arrange', prompt: 'رتّب الكلمات لتكوين: صباح الخير يا صديقي', targetSentence: 'Buenos días mi amigo', tiles: ['amigo', 'Buenos', 'agua', 'mi', 'días', 'noche'] },
      { id: 'es-s2', type: 'listen', prompt: 'استمع جيداً ثم اختر المعنى الصحيح', audioText: 'Muchas gracias por todo', options: ['شكراً جزيلاً على كل شيء', 'كوب ماء من فضلك', 'أين المطار؟', 'أنا من القاهرة'], correctIndex: 0 },
      { id: 'es-s3', type: 'choice', prompt: 'كيف تطلب كوب ماء بأدب بالإسبانية؟', audioText: 'Un vaso de agua, por favor', options: ['Un vaso de agua, por favor', 'Buenas noches', 'Mucho gusto', 'Hasta mañana'], correctIndex: 0 },
    ],
  },

  الألمانية: {
    lessons: {
      1: {
        title: 'الدرس 1: التحيات وبناء الجملة الألمانية',
        summary: 'أهم تحيات الحياة اليومية وأسلوب النطق الألماني الواضح.',
        tip: 'في الألمانية تُكتب جميع الأسماء (Nomen) بحرف كبير في بدايتها دائماً، مثل Wasser (ماء) وBuch (كتاب).',
        culture: 'الدقة في المواعيد واستخدام "Guten Tag" في اللقاءات الرسمية من سمات الثقافة الألمانية.',
        vocab: [
          { w: 'Hallo', p: 'هالو', t: 'مرحباً', ex: 'Hallo, ich heiße Tariq.', ext: 'مرحباً، اسمي طارق.' },
          { w: 'Guten Morgen', p: 'غوتن مورغن', t: 'صباح الخير', ex: 'Guten Morgen, wie geht es Ihnen?', ext: 'صباح الخير، كيف حالك؟' },
          { w: 'Danke schön', p: 'دانكه شون', t: 'شكراً جزيلاً', ex: 'Danke schön für Ihre Hilfe.', ext: 'شكراً جزيلاً على مساعدتك.' },
          { w: 'Wasser', p: 'فاسر', t: 'ماء', ex: 'Ein Glas Wasser, bitte.', ext: 'كوب ماء، من فضلك.' },
        ],
        dialogue: [
          { s: 'طارق', l: 'Hallo! Ich heiße Tariq.', t: 'مرحباً! اسمي طارق.' },
          { s: 'هانا', l: 'Hallo Tariq! Freut mich sehr.', t: 'مرحباً طارق! تشرفت بك جداً.' },
        ],
        paraTitle: 'صباحي في برلين',
        para: 'Guten Morgen! Ich trinke Tee und lerne jeden Tag fünf neue deutsche Wörter.',
        paraTr: 'صباح الخير! أشرب الشاي وأتعلم خمس كلمات ألمانية جديدة كل يوم.',
        keys: ['Morgen', 'lerne', 'Wörter'],
      },
      2: {
        title: 'الدرس 1: المحطة والطلبات اليومية بالألمانية',
        summary: 'الطلب في المقهى والسؤال عن الأسعار والاتجاهات.',
        tip: 'الفعل المصرف في الجملة الخبرية الألمانية يحتل دائماً المركز الثاني.',
        culture: 'كلمة "Bitte" تعني "من فضلك" و"عفواً" في نفس الوقت.',
        vocab: [
          { w: 'Bahnhof', p: 'بان هوف', t: 'محطة القطار', ex: 'Wo ist der Bahnhof?', ext: 'أين محطة القطار؟' },
          { w: 'Fahrkarte', p: 'فار كارته', t: 'تذكرة سفر', ex: 'Ich brauche eine Fahrkarte.', ext: 'أحتاج إلى تذكرة.' },
        ],
        dialogue: [
          { s: 'كريم', l: 'Entschuldigung, wo ist der Bahnhof?', t: 'عفواً، أين محطة القطار؟' },
          { s: 'ماكس', l: 'Gehen Sie geradeaus.', t: 'امشِ للأمام مباشرة.' },
        ],
        paraTitle: 'في الطريق للعمل',
        para: 'Ich fahre jeden Morgen mit dem Zug zur Arbeit und höre dabei ein Hörbuch.',
        paraTr: 'أذهب كل صباح بالقطار إلى العمل وأستمع لكتاب صوتي.',
        keys: ['Zug', 'Arbeit', 'Hörbuch'],
      },
      3: {
        title: 'الدرس 1: التعبير المنهجي والأسلوب المتقدم',
        summary: 'بناء الجمل الفرعية باستخدام weil وobwohl والتعبير المهني.',
        tip: 'مع أداة الربط weil (لأن) ينتقل الفعل المصرف إلى نهاية الجملة الفرعية.',
        culture: 'الألمانية تفضل الصياغات الواضحة والمباشرة في العمل والبحث العلمي.',
        vocab: [
          { w: 'Perspektive', p: 'بيرسبيكتيفه', t: 'منظور', ex: 'Aus einer neuen Perspektive.', ext: 'من منظور جديد.' },
          { w: 'Erfahrung', p: 'إيرفارونغ', t: 'خبرة / تجربة', ex: 'Das war eine wertvolle Erfahrung.', ext: 'كانت تجربة قيّمة.' },
        ],
        dialogue: [
          { s: 'المشرف', l: 'Warum lernen Sie Deutsch?', t: 'لماذا تتعلم الألمانية؟' },
          { s: 'المتعلم', l: 'Weil ich im Ingenieurwesen arbeiten möchte.', t: 'لأنني أرغب في العمل بمجال الهندسة.' },
        ],
        paraTitle: 'إتقان الألمانية',
        para: 'Kontinuierliches Üben führt Schritt für Schritt zu sicherer Ausdrucksfähigkeit und kulturellem Verständnis.',
        paraTr: 'التدرب المتواصل يقود خطوة بخطوة إلى قدرة تعبيرية واثقة وفهم ثقافي عميق.',
        keys: ['Üben', 'Ausdrucksfähigkeit'],
      },
    },
    wordWriting: [
      { word: 'Danke', pronunciation: 'دانكه', meaning: 'شكراً', explanation: 'كلمة الشكر الأساسية بالألمانية، ويُلفظ حرف E في نهايتها بوضوح.', example: 'Danke für alles!', exampleTranslation: 'شكراً على كل شيء!' },
      { word: 'Wasser', pronunciation: 'فاسر', meaning: 'ماء', explanation: 'يُكتب بحرف W كبير لأن الأسماء الألمانية تبدأ دوماً بحرف كبير.', example: 'Ein Wasser, bitte.', exampleTranslation: 'ماء من فضلك.' },
    ],
    writing: [
      { prompt: 'اكتب بالألمانية: مرحباً، اسمي طارق.', expected: 'Hallo, ich heiße Tariq.', hint: 'Hallo + ich heiße...' },
      { prompt: 'اكتب بالألمانية: شكراً جزيلاً.', expected: 'Danke schön.', hint: 'Danke + schön' },
    ],
    speaking: [
      { phrase: 'Guten Morgen, wie geht es Ihnen?', phonetic: 'غوتن مورغن، في غيت إس إينن؟', translation: 'صباح الخير، كيف حالك؟' },
      { phrase: 'Ich lerne jeden Tag Deutsch.', phonetic: 'إيش ليرنه ييدن تاغ دويتش', translation: 'أتعلم الألمانية كل يوم.' },
    ],
    fillBlanks: [
      { before: 'Ich', after: 'Tariq.', options: ['heiße', 'Wasser', 'Bahnhof', 'Morgen'], correct: 'heiße', translation: 'اسمي طارق.' },
      { before: 'Ein Glas Wasser,', after: '.', options: ['bitte', 'danke', 'hallo', 'gut'], correct: 'bitte', translation: 'كوب ماء من فضلك.' },
    ],
    matching: [
      { target: 'Hallo', native: 'مرحباً', pronunciation: 'هالو' },
      { target: 'Danke', native: 'شكراً', pronunciation: 'دانكه' },
      { target: 'Wasser', native: 'ماء', pronunciation: 'فاسر' },
      { target: 'Freund', native: 'صديق', pronunciation: 'فرويند' },
      { target: 'Buch', native: 'كتاب', pronunciation: 'بوخ' },
    ],
    readingQ: { q: 'ماذا يتعلم المتحدث كل يوم؟', opts: ['خمس كلمات ألمانية جديدة', 'رسم اللوحات', 'كرة القدم'], ans: 0 },
    sprint: [
      { id: 'de-s1', type: 'arrange', prompt: 'رتّب الكلمات بالألمانية: مرحباً، اسمي طارق', targetSentence: 'Hallo ich heiße Tariq', tiles: ['Tariq', 'Hallo', 'Wasser', 'heiße', 'ich', 'Buch'] },
      { id: 'de-s2', type: 'listen', prompt: 'استمع للعبارة الألمانية واختر معناها', audioText: 'Danke schön, bis morgen', options: ['شكراً جزيلاً، أراك غداً', 'أين محطة القطار؟', 'ماء من فضلك', 'صباح الخير'], correctIndex: 0 },
      { id: 'de-s3', type: 'choice', prompt: 'كيف تقول "كوب ماء من فضلك" بالألمانية؟', audioText: 'Ein Glas Wasser, bitte', options: ['Ein Glas Wasser, bitte', 'Guten Morgen', 'Danke schön', 'Mein Freund'], correctIndex: 0 },
    ],
  },

  البرتغالية: {
    lessons: {
      1: {
        title: 'المرحلة 1: التحيات والنطق البرتغالي الأساسي',
        summary: 'تعلّم أهم عبارات الترحيب والشكر البرتغالية والأصوات الأنفية.',
        tip: 'في البرتغالية يُنطق المقطع ão كـ "أوْ" أنفية مثل Obrigado / Não، ويُستخدم Obrigado للمذكر وObrigada للمؤنث.',
        culture: 'يبدأ المتحدثون بالبرتغالية صباحهم بعبارة "Bom dia!" الحارة والودّية.',
        vocab: [
          { w: 'Olá', p: 'أولا', t: 'مرحباً', ex: 'Olá, como está?', ext: 'مرحباً، كيف حالك؟' },
          { w: 'Bom dia', p: 'بون ديا', t: 'صباح الخير', ex: 'Bom dia, meu amigo!', ext: 'صباح الخير يا صديقي!' },
          { w: 'Obrigado', p: 'أوبريغادو', t: 'شكراً لك', ex: 'Muito obrigado pela ajuda.', ext: 'شكراً جزيلاً على المساعدة.' },
          { w: 'Água', p: 'آغوا', t: 'ماء', ex: 'Um copo de água, por favor.', ext: 'كوب ماء، من فضلك.' },
        ],
        dialogue: [
          { s: 'طارق', l: 'Olá! O meu nome é Tariq.', t: 'مرحباً! اسمي طارق.' },
          { s: 'آنا', l: 'Muito prazer, Tariq!', t: 'تشرفت بك جداً يا طارق!' },
        ],
        paraTitle: 'صباح في لشبونة',
        para: 'Bom dia! Todas as manhãs bebo café com água fresca e leio um livro em português.',
        paraTr: 'صباح الخير! كل صباح أشرب القهوة مع الماء المنعش وأقرأ كتاباً بالبرتغالية.',
        keys: ['Bom dia', 'café', 'português'],
      },
      2: {
        title: 'المرحلة 2: المقهى والسفر بالبرتغالية',
        summary: 'الطلب في المطعم والسؤال عن المحطة والتذاكر والأسعار.',
        tip: 'للسؤال عن المكان نستخدم: "Onde fica...?" مثل Onde fica a estação?',
        culture: 'تُعدّ عبارة "Com licença" مفتاحاً مهذباً لبدء أي سؤال في الشارع أو المتجر.',
        vocab: [
          { w: 'Estação', p: 'إستاساو', t: 'محطة القطار', ex: 'Onde fica a estação?', ext: 'أين تقع المحطة؟' },
          { w: 'Bilhete', p: 'بيليتي', t: 'تذكرة', ex: 'Quero um bilhete, por favor.', ext: 'أريد تذكرة من فضلك.' },
        ],
        dialogue: [
          { s: 'كريم', l: 'Com licença, quanto custa este bilhete?', t: 'عفواً، كم سعر هذه التذكرة؟' },
          { s: 'جواو', l: 'Custa cinco euros, senhor.', t: 'سعرها خمسة يورو يا سيدي.' },
        ],
        paraTitle: 'رحلة بالقطار',
        para: 'Hoje vou à estação comprar um bilhete para viajar até ao Porto e praticar português.',
        paraTr: 'اليوم أذهب إلى المحطة لشراء تذكرة للسفر إلى بورتو وممارسة البرتغالية.',
        keys: ['estação', 'bilhete', 'viajar'],
      },
      3: {
        title: 'المرحلة المتقدمة: التعبير والطلاقة البرتغالية',
        summary: 'صياغة الآراء والروابط المنطقية والأمثال البرتغالية الراقية.',
        tip: 'استخدم "Na minha opinião" لإبداء الرأي و"Apesar de" للتعبير عن التناقض بدقة.',
        culture: 'يُقال في البرتغالية "Água mole em pedra dura tanto bate até que fura" بمعنى المثابرة تصنع المعجزات.',
        vocab: [
          { w: 'Experiência', p: 'إسبيريينسيا', t: 'خبرة / تجربة', ex: 'Foi uma experiência inesquecível.', ext: 'كانت تجربة لا تُنسى.' },
          { w: 'Persistência', p: 'بيرسيستينسيا', t: 'مثابرة', ex: 'A persistência traz fluência.', ext: 'المثابرة تجلب الطلاقة.' },
        ],
        dialogue: [
          { s: 'المعلم', l: 'Qual é o segredo para falar português com fluência?', t: 'ما سر التحدث بالبرتغالية بطلاقة؟' },
          { s: 'الطالب', l: 'Na minha opinião, ouvir e praticar todos os dias é essencial.', t: 'في رأيي، الاستماع والممارسة يومياً أمر أساسي.' },
        ],
        paraTitle: 'جوهر الإتقان',
        para: 'A verdadeira fluência em português nasce da persistência diária, da leitura atenta e do diálogo constante.',
        paraTr: 'تنبع الطلاقة الحقيقية في البرتغالية من المثابرة اليومية والقراءة المتأنية والحوار المستمر.',
        keys: ['fluência', 'persistência', 'diálogo'],
      },
    },
    wordWriting: [
      { word: 'Obrigado', pronunciation: 'أوبريغادو', meaning: 'شكراً لك', explanation: 'أشهر كلمة شكر في البرتغالية؛ يقولها الرجل Obrigado وتقولها المرأة Obrigada.', example: 'Muito obrigado!', exampleTranslation: 'شكراً جزيلاً!' },
      { word: 'Amanhã', pronunciation: 'أمانيَان', meaning: 'غداً', explanation: 'حرف ã أنفي وحرف nh يُنطق مثل نْي خفيفة متصلة.', example: 'Até amanhã!', exampleTranslation: 'أراك غداً!' },
      { word: 'Água', pronunciation: 'آغوا', meaning: 'ماء', explanation: 'النبرة على الألف الأولى Á وتُنطق "آغوا".', example: 'Água fresca, por favor.', exampleTranslation: 'ماء بارد، من فضلك.' },
    ],
    writing: [
      { prompt: 'اكتب بالبرتغالية: صباح الخير، شكراً جزيلاً.', expected: 'Bom dia, muito obrigado.', hint: 'Bom dia + muito obrigado' },
      { prompt: 'اكتب بالبرتغالية: مرحباً، اسمي طارق.', expected: 'Olá, o meu nome é Tariq.', hint: 'Olá + o meu nome é...' },
    ],
    speaking: [
      { phrase: 'Bom dia! Como está hoje?', phonetic: 'بون ديا! كومو إستا أوژي؟', translation: 'صباح الخير! كيف حالك اليوم؟' },
      { phrase: 'Muito obrigado, até amanhã.', phonetic: 'مويتو أوبريغادو، أتيه أمانيَان', translation: 'شكراً جزيلاً، أراك غداً.' },
    ],
    fillBlanks: [
      { before: 'Um café, por', after: '.', options: ['favor', 'bom', 'água', 'livro'], correct: 'favor', translation: 'قهوة، من فضلك.' },
      { before: 'Onde fica a', after: 'de comboios?', options: ['estação', 'obrigado', 'manhã', 'sol'], correct: 'estação', translation: 'أين تقع محطة القطارات؟' },
    ],
    matching: [
      { target: 'Olá', native: 'مرحباً', pronunciation: 'أولا' },
      { target: 'Obrigado', native: 'شكراً', pronunciation: 'أوبريغادو' },
      { target: 'Água', native: 'ماء', pronunciation: 'آغوا' },
      { target: 'Amigo', native: 'صديق', pronunciation: 'أميغو' },
      { target: 'Livro', native: 'كتاب', pronunciation: 'ليفرو' },
    ],
    readingQ: { q: 'ما الذي يقرأه المتحدث بالبرتغالية؟', opts: ['كتاباً بالبرتغالية', 'رسالة قديمة', 'صحيفة رياضية'], ans: 0 },
    sprint: [
      { id: 'pt-s1', type: 'arrange', prompt: 'رتّب الكلمات بالبرتغالية: صباح الخير يا صديقي', targetSentence: 'Bom dia meu amigo', tiles: ['amigo', 'Bom', 'água', 'meu', 'dia', 'livro'] },
      { id: 'pt-s2', type: 'listen', prompt: 'استمع للعبارة البرتغالية واختر معناها', audioText: 'Muito obrigado, até amanhã', options: ['شكراً جزيلاً، أراك غداً', 'أين محطة القطار؟', 'كوب ماء من فضلك', 'اسمي طارق'], correctIndex: 0 },
      { id: 'pt-s3', type: 'choice', prompt: 'كيف تطلب كوب ماء بأدب بالبرتغالية؟', audioText: 'Um copo de água, por favor', options: ['Um copo de água, por favor', 'Bom dia', 'Boa noite', 'Até amanhã'], correctIndex: 0 },
    ],
  },

  الإيطالية: {
    lessons: {
      1: {
        title: 'الدرس 1: التحيات الإيطالية الموسيقية',
        summary: 'عبارات الترحيب واللباقة اليومية بالإيطالية.',
        tip: 'كلمة Ciao تُستخدم بين الأصدقاء للتحية والوداع معاً.',
        culture: 'الإيطالية لغة موسيقية تبرز فيها الحروف الصوتية بوضوح تام.',
        vocab: [
          { w: 'Ciao', p: 'تشاو', t: 'مرحباً / وداعاً', ex: 'Ciao! Come stai?', ext: 'مرحباً! كيف حالك؟' },
          { w: 'Grazie', p: 'غراتسيه', t: 'شكراً', ex: 'Grazie mille!', ext: 'ألف شكر!' },
          { w: 'Per favore', p: 'بير فافوري', t: 'من فضلك', ex: 'Un caffè, per favore.', ext: 'قهوة من فضلك.' },
        ],
        dialogue: [
          { s: 'ماركو', l: 'Buongiorno! Mi chiamo Marco.', t: 'صباح الخير! اسمي ماركو.' },
          { s: 'نورا', l: 'Piacere! Io sono Nora.', t: 'تشرفت! أنا نورا.' },
        ],
        paraTitle: 'صباح في روما',
        para: 'Buongiorno! Ogni mattina bevo un caffè e leggo un libro italiano con piacere.',
        paraTr: 'صباح الخير! كل صباح أشرب القهوة وأقرأ كتاباً إيطالياً بسرور.',
        keys: ['Buongiorno', 'caffè', 'libro'],
      },
      2: {
        title: 'الدرس 1: المقهى والسفر بالإيطالية',
        summary: 'الطلب في المطاعم والسؤال عن الاتجاهات.',
        tip: 'نقول "Dov’è la stazione?" للسؤال عن المحطة.',
        culture: 'القهوة تُشرب غالباً واقفاً في المقهى الإيطالي السريع.',
        vocab: [
          { w: 'Stazione', p: 'ستاتسيوني', t: 'محطة', ex: 'Dov’è la stazione?', ext: 'أين المحطة؟' },
          { w: 'Biglietto', p: 'بيليتو', t: 'تذكرة', ex: 'Vorrei un biglietto.', ext: 'أريد تذكرة.' },
        ],
        dialogue: [
          { s: 'أحمد', l: 'Scusi, dov’è il museo?', t: 'عفواً، أين المتحف؟' },
          { s: 'صوفيا', l: 'Sempre dritto, poi a destra.', t: 'مباشرة للأمام ثم يميناً.' },
        ],
        paraTitle: 'رحلة في القطار',
        para: 'Prendo il treno per Firenze e guardo il paesaggio dal finestrino.',
        paraTr: 'أستقل القطار إلى فلورنسا وأشاهد المناظر من النافذة.',
        keys: ['treno', 'Firenze'],
      },
      3: {
        title: 'الدرس 1: التعبير الراقي والبلاغة الإيطالية',
        summary: 'تراكيب متقدمة لإبداء الرأي والمقارنة.',
        tip: 'عبارة "Secondo me" تعني "حسب رأيي" وهي شائعة في كل النقاشات.',
        culture: 'الحوار الثقافي والفني ركيزة في الحياة اليومية الإيطالية.',
        vocab: [
          { w: 'Prospettiva', p: 'بروسبيتييفا', t: 'منظور', ex: 'Da una nuova prospettiva.', ext: 'من منظور جديد.' },
          { w: 'Costanza', p: 'كوستانتسا', t: 'مثابرة', ex: 'La costanza porta successo.', ext: 'المثابرة تجلب النجاح.' },
        ],
        dialogue: [
          { s: 'أستاذ', l: 'Come si raggiunge la padronanza?', t: 'كيف نصل إلى الإتقان؟' },
          { s: 'متعلم', l: 'Con ascolto quotidiano e passione.', t: 'بالاستماع اليومي والشغف.' },
        ],
        paraTitle: 'جمال الإيطالية',
        para: 'La padronanza linguistica nasce dalla costanza e dall’immersione quotidiana nella lettura.',
        paraTr: 'يولد التمكّن اللغوي من المثابرة والانغماس اليومي في القراءة.',
        keys: ['padronanza', 'costanza'],
      },
    },
    wordWriting: [
      { word: 'Grazie', pronunciation: 'غراتسيه', meaning: 'شكراً', explanation: 'حرف Z يُنطق (تس) خفيفة، وتُستخدم للشكر في كل المواقف.', example: 'Grazie mille!', exampleTranslation: 'شكراً جزيلاً!' },
      { word: 'Ciao', pronunciation: 'تشاو', meaning: 'مرحباً / إلى اللقاء', explanation: 'تُنطق Ci كـ "تش"، وتُقال عند القدوم والوداع بين الأصدقاء.', example: 'Ciao, a domani!', exampleTranslation: 'وداعاً، أراك غداً!' },
    ],
    writing: [
      { prompt: 'اكتب بالإيطالية: صباح الخير، شكراً جزيلاً.', expected: 'Buongiorno, grazie mille.', hint: 'Buongiorno + grazie mille' },
    ],
    speaking: [
      { phrase: 'Buongiorno, come sta oggi?', phonetic: 'بونجورنو، كومي ستا أوجي؟', translation: 'صباح الخير، كيف حالك اليوم؟' },
    ],
    fillBlanks: [
      { before: 'Un caffè, per', after: '.', options: ['favore', 'grazie', 'ciao', 'amico'], correct: 'favore', translation: 'قهوة، من فضلك.' },
    ],
    matching: [
      { target: 'Ciao', native: 'مرحباً', pronunciation: 'تشاو' },
      { target: 'Grazie', native: 'شكراً', pronunciation: 'غراتسيه' },
      { target: 'Acqua', native: 'ماء', pronunciation: 'أكوا' },
      { target: 'Amico', native: 'صديق', pronunciation: 'أميكو' },
      { target: 'Libro', native: 'كتاب', pronunciation: 'ليبرو' },
    ],
    readingQ: { q: 'ماذا يفعل المتحدث كل صباح؟', opts: ['يشرب القهوة ويقرأ كتاباً', 'ينام', 'يلعب'], ans: 0 },
    sprint: [
      { id: 'it-s1', type: 'arrange', prompt: 'رتّب الكلمات بالإيطالية: مرحباً، اسمي طارق', targetSentence: 'Ciao mi chiamo Tariq', tiles: ['Tariq', 'Ciao', 'acqua', 'chiamo', 'mi', 'libro'] },
      { id: 'it-s2', type: 'listen', prompt: 'استمع للعبارة الإيطالية واختر معناها', audioText: 'Grazie mille, buongiorno', options: ['ألف شكر، صباح الخير', 'أين المطار؟', 'ماء من فضلك', 'أراك غداً'], correctIndex: 0 },
    ],
  },

  العربية: {
    lessons: {
      1: {
        title: 'الدرس 1: التحيات العربية وبناء الجملة الاسمية',
        summary: 'تعلّم التحيات الفصيحة ومخارج الحروف العربية الواضحة.',
        tip: 'تبدأ الجملة الاسمية في العربية بمبتدأ وخبر مرفوعين مثل: العلمُ نورٌ.',
        culture: 'تحية "السلام عليكم" و"أهلاً وسهلاً" تعبّر عن الترحيب والكرم العربي الأصيل.',
        vocab: [
          { w: 'مرحباً', p: 'Marhaban', t: 'Hello / Welcome', ex: 'مرحباً بكم في تطبيقنا.', ext: 'Welcome to our app.' },
          { w: 'شكراً جزيلاً', p: 'Shukran jazeelan', t: 'Thank you very much', ex: 'شكراً جزيلاً على تعاونك.', ext: 'Thank you very much for your help.' },
          { w: 'كتاب', p: 'Kitab', t: 'Book', ex: 'هذا كتابٌ مفيد.', ext: 'This is a useful book.' },
        ],
        dialogue: [
          { s: 'سارة', l: 'السلام عليكم، كيف حالك اليوم؟', t: 'Peace be upon you, how are you today?' },
          { s: 'أحمد', l: 'وعليكم السلام، أنا بخير والحمد لله.', t: 'I am doing well, thank you.' },
        ],
        paraTitle: 'جمال اللغة العربية',
        para: 'اللغة العربية لغة غنية بالمفردات والمعاني الدقيقة، وتجمع بين الأصالة والبيان الواضح.',
        paraTr: 'Arabic is rich in vocabulary and precise meanings, combining heritage and clarity.',
        keys: ['العربية', 'المفردات', 'البيان'],
      },
      2: {
        title: 'الدرس 1: الحوار اليومي والفعل المضارع',
        summary: 'تكوين الجمل الفعلية للتعبير عن النشاط اليومي.',
        tip: 'الفعل المضارع يدل على الحاضر والمستقبل القريب مثل: أقرأُ كل صباح.',
        culture: 'القراءة والتأمل في الشعر والحِكم من ركائز التذوق العربي.',
        vocab: [
          { w: 'يسافر', p: 'Yusafir', t: 'Travels', ex: 'يسافر صديقي غداً.', ext: 'My friend travels tomorrow.' },
          { w: 'محطة', p: 'Mahatta', t: 'Station', ex: 'المحطة قريبة من هنا.', ext: 'The station is near here.' },
        ],
        dialogue: [
          { s: 'عمر', l: 'متى يغادر القطار؟', t: 'When does the train depart?' },
          { s: 'يوسف', l: 'يغادر في الساعة الثامنة صباحاً.', t: 'It departs at 8 AM.' },
        ],
        paraTitle: 'صباح المعرفة',
        para: 'أبدأ يومي بقراءة صفحة من كتاب جديد وتدوين أهم الكلمات في دفتري.',
        paraTr: 'I start my day by reading a page from a new book and noting key words.',
        keys: ['قراءة', 'كتاب', 'تدوين'],
      },
      3: {
        title: 'الدرس 1: البلاغة العربية والأساليب الرفيعة',
        summary: 'استخدام الأساليب البلاغية والترادف الدقيق.',
        tip: 'يساعد اختيار المفردة الدقيقة في إبراز المعنى وإقناع القارئ.',
        culture: 'البيان العربي يعتني بالإيجاز البليغ وحُسن السبك.',
        vocab: [
          { w: 'البلاغة', p: 'Al-Balagha', t: 'Eloquence', ex: 'البلاغة مطابقة الكلام لمقتضى الحال.', ext: 'Eloquence matches speech to context.' },
          { w: 'المثابرة', p: 'Al-Muthabara', t: 'Perseverance', ex: 'المثابرة طريق الإبداع.', ext: 'Perseverance is the path to excellence.' },
        ],
        dialogue: [
          { s: 'الأستاذ', l: 'كيف تنمّي ذائقتك اللغوية؟', t: 'How do you cultivate linguistic taste?' },
          { s: 'الطالب', l: 'بمطالعة أمهات الكتب وحفظ الشواهد البليغة.', t: 'By reading classics and memorizing eloquent lines.' },
        ],
        paraTitle: 'الإتقان والبيان',
        para: 'إنّ المداومة على المطالعة الواعية والاستماع الفصيح تصقل اللسان وتوسّع المدارك.',
        paraTr: 'Consistent mindful reading and eloquent listening refine speech and broaden horizons.',
        keys: ['المطالعة', 'البيان'],
      },
    },
    wordWriting: [
      { word: 'سلام', pronunciation: 'Salam', meaning: 'أمان وطمأنينة وتحية', explanation: 'كلمة عربية أصيلة جذرها (س ل م) وتُستخدم في التحية والسلام.', example: 'السلام عليكم ورحمة الله.', exampleTranslation: 'Peace be upon you.' },
      { word: 'علم', pronunciation: 'Ilm', meaning: 'معرفة وإدراك', explanation: 'مصدر ثلاثي يدل على المعرفة اليقينية والفهم العميق.', example: 'العلم نور يضيء العقول.', exampleTranslation: 'Knowledge is a light.' },
    ],
    writing: [
      { prompt: 'اكتب عبارة ترحيب عربية فصيحة:', expected: 'أهلاً وسهلاً بكم، تشرفت بلقائكم.', hint: 'أهلاً وسهلاً + تشرفت' },
    ],
    speaking: [
      { phrase: 'مرحباً، سررت بالتحدث معكم اليوم.', phonetic: 'Marhaban, surirtu bi-t-tahadduth ma‘akum', translation: 'Hello, pleased to speak with you today.' },
    ],
    fillBlanks: [
      { before: 'العلمُ', after: 'يضيء العقول.', options: ['نورٌ', 'ماءٌ', 'طريقٌ', 'ليلٌ'], correct: 'نورٌ', translation: 'Knowledge is light.' },
    ],
    matching: [
      { target: 'مرحباً', native: 'Hello', pronunciation: 'Marhaban' },
      { target: 'شكراً', native: 'Thank you', pronunciation: 'Shukran' },
      { target: 'ماء', native: 'Water', pronunciation: 'Ma’' },
      { target: 'صديق', native: 'Friend', pronunciation: 'Sadeeq' },
      { target: 'كتاب', native: 'Book', pronunciation: 'Kitab' },
    ],
    readingQ: { q: 'ما الذي تصقله المطالعة الواعية حسب النص؟', opts: ['اللسان والمدارك', 'السرعة فقط', 'النسيان'], ans: 0 },
    sprint: [
      { id: 'ar-s1', type: 'arrange', prompt: 'رتّب الكلمات لتكوين جملة عربية صحيحة', targetSentence: 'العلم نور يضيء العقول', tiles: ['العقول', 'العلم', 'يضيء', 'نور', 'قلم'] },
      { id: 'ar-s2', type: 'listen', prompt: 'استمع للعبارة واختر معناها', audioText: 'أهلاً وسهلاً بكم', options: ['ترحيب حار بالضيوف', 'وداع سريع', 'سؤال عن الوقت', 'طلب الماء'], correctIndex: 0 },
    ],
  },
};

const CURRICULUM_FACTORIES: Record<string, LangPackFactory> = {
  الروسية: buildRussianStarter,
  الإنجليزية: buildEnglishStarter,
};

for (const [lang, seed] of Object.entries(SEEDS)) {
  CURRICULUM_FACTORIES[lang] = (level: number) => packFromSeed(lang.slice(0, 2), level, seed);
}

const SPRINT_FACTORIES: Record<string, SprintFactory> = {
  الروسية: buildRussianSprint,
  الإنجليزية: buildEnglishSprint,
};

for (const [lang, seed] of Object.entries(SEEDS)) {
  SPRINT_FACTORIES[lang] = () => seed.sprint;
}

export function hasStaticCurriculum(targetLanguage: string): boolean {
  return Boolean(CURRICULUM_FACTORIES[targetLanguage]);
}

export function getStarterContent(targetLanguage: string, level: number): StarterContent | null {
  const factory = CURRICULUM_FACTORIES[targetLanguage];
  if (!factory) return null;
  return factory(level);
}

export function getStarterInteractiveSprint(
  targetLanguage: string,
  level: number
): InteractiveSprintStep[] | null {
  const factory = SPRINT_FACTORIES[targetLanguage];
  if (!factory) return null;
  return factory(level);
}

export function getStagesForLevel(targetLanguage: string, level: number): StageDefinition[] {
  const langTag = targetLanguage || 'اللغة';
  if (level === 1) {
    return [
      {
        id: `st-l1-1`,
        order: 1,
        title: `الحروف والنطق (${langTag})`,
        subtitle: 'تعرّف على الحروف ونطقها باللغة المعاكسة مباشرة تحت كل حرف',
        mode: 'alphabet',
        xpReward: 25,
      },
      {
        id: `st-l1-2`,
        order: 2,
        title: 'كتابة الكلمات وشرح معناها',
        subtitle: 'تدرّب على كتابة الكلمات الأولى وفهم معناها ونطقها',
        mode: 'writing',
        writingSubMode: 'words',
        xpReward: 30,
      },
      {
        id: `st-l1-3`,
        order: 3,
        title: 'الجولة التفاعلية: ترتيب واستماع',
        subtitle: 'ركّب جمل التحية الأولى واستمع للنطق السريع والبطيء',
        mode: 'sprint',
        xpReward: 35,
      },
      {
        id: `st-l1-4`,
        order: 4,
        title: 'ملئ الفراغات وربط الكلمات',
        subtitle: 'اربط الكلمات بمعانيها وأكمل الجمل الأساسية',
        mode: 'fillBlank',
        xpReward: 30,
      },
      {
        id: `st-l1-5`,
        order: 5,
        title: 'الرسائل الصوتية والنطق الشفهي',
        subtitle: 'استمع للمتحدث الناطق وأعد نطق العبارات بالميكروفون',
        mode: 'speaking',
        xpReward: 35,
      },
      {
        id: `st-l1-6`,
        order: 6,
        title: 'قراءة الفقرة والتقييم الصوتي',
        subtitle: 'اقرأ الفقرة الأولى بصوتك وتحقق من فهمك لاجتياز المستوى',
        mode: 'reading',
        xpReward: 45,
      },
    ];
  }

  if (level === 2) {
    return [
      {
        id: `st-l2-1`,
        order: 1,
        title: 'ربط المفردات اليومية',
        subtitle: 'توسيع مفردات المقهى، المواصلات، والمشتريات',
        mode: 'matching',
        xpReward: 25,
      },
      {
        id: `st-l2-2`,
        order: 2,
        title: 'جولة تكوين الجمل اليومية',
        subtitle: 'رتّب الكلمات لتكوين أسئلة وجمل عملية',
        mode: 'sprint',
        xpReward: 35,
      },
      {
        id: `st-l2-3`,
        order: 3,
        title: 'كتابة الكلمات والعبارات',
        subtitle: 'إملاء وكتابة كلمات المواقف اليومية مع شرح المعنى',
        mode: 'writing',
        writingSubMode: 'words',
        xpReward: 30,
      },
      {
        id: `st-l2-4`,
        order: 4,
        title: 'ملئ الفراغات السياقية',
        subtitle: 'اختر الفعل أو الأداة الأنسب لكل موقف يومي',
        mode: 'fillBlank',
        xpReward: 30,
      },
      {
        id: `st-l2-5`,
        order: 5,
        title: 'الحوار الصوتي مع المتحدث',
        subtitle: 'تدرّب على نطق أسئلة السفر والمطاعم عبر الميكروفون',
        mode: 'speaking',
        xpReward: 40,
      },
      {
        id: `st-l2-6`,
        order: 6,
        title: 'القراءة التطبيقية بالوسيلة الصوتية',
        subtitle: 'استمع للفقرة وأعد قراءتها بطلاقة',
        mode: 'reading',
        xpReward: 45,
      },
    ];
  }

  if (level === 3) {
    return [
      {
        id: `st-l3-1`,
        order: 1,
        title: 'جولة الأزمنة والروابط التفاعلية',
        subtitle: 'تحدي سرعة لبناء جمل الماضي والمستقبل والآراء',
        mode: 'sprint',
        xpReward: 35,
      },
      {
        id: `st-l3-2`,
        order: 2,
        title: 'كتابة الجمل والتقييم الذكي',
        subtitle: 'صِغ جملاً متوسطة واحصل على تصحيح فوري دقيق',
        mode: 'writing',
        writingSubMode: 'sentences',
        xpReward: 40,
      },
      {
        id: `st-l3-3`,
        order: 3,
        title: 'ملئ الفراغات التركيبية',
        subtitle: 'تمارين الأزمنة وحروف الجر والروابط المنطقية',
        mode: 'fillBlank',
        xpReward: 35,
      },
      {
        id: `st-l3-4`,
        order: 4,
        title: 'ربط التعابير والخبرات',
        subtitle: 'طابق المفردات المتوسطة مع معانيها الدقيقة',
        mode: 'matching',
        xpReward: 30,
      },
      {
        id: `st-l3-5`,
        order: 5,
        title: 'الطلاقة الصوتية والظلال النطقي',
        subtitle: 'تحدّث مع الرسالة الصوتية وحاكِ نبرة أهل اللغة',
        mode: 'speaking',
        xpReward: 40,
      },
      {
        id: `st-l3-6`,
        order: 6,
        title: 'قراءة وتحليل الفقرة المتوسطة',
        subtitle: 'اقرأ الفقرة صوتياً وأجب عن سؤال الفهم العميق',
        mode: 'reading',
        xpReward: 50,
      },
    ];
  }

  const isMaster = level === 5;
  return [
    {
      id: `st-l${level}-1`,
      order: 1,
      title: isMaster ? 'تحدي البلاغة والإتقان السريع' : 'جولة التراكيب المتقدمة',
      subtitle: isMaster
        ? 'تمارين رفيعة المستوى في البلاغة والتعابير الاصطلاحية'
        : 'بناء جمل متقدمة وتفريق الدلالات الدقيقة',
      mode: 'sprint',
      xpReward: 40,
    },
    {
      id: `st-l${level}-2`,
      order: 2,
      title: isMaster ? 'الصياغة البلاغية والتقييم الدقيق' : 'الكتابة المهنية والأكاديمية',
      subtitle: 'اكتب فقرات وحججاً واضحة مع تصحيح فوري للأسلوب',
      mode: 'writing',
      writingSubMode: 'sentences',
      xpReward: 45,
    },
    {
      id: `st-l${level}-3`,
      order: 3,
      title: isMaster ? 'ربط الأمثال والمصطلحات العليا' : 'ربط التعابير الاصطلاحية',
      subtitle: 'توسيع الحصيلة اللغوية الرفيعة',
      mode: 'matching',
      xpReward: 35,
    },
    {
      id: `st-l${level}-4`,
      order: 4,
      title: 'ملئ الفراغات الدقيقة',
      subtitle: 'اختيار الكلمة الأدق بلاغياً وسياقياً',
      mode: 'fillBlank',
      xpReward: 40,
    },
    {
      id: `st-l${level}-5`,
      order: 5,
      title: isMaster ? 'الإلقاء الصوتي المتقن' : 'التحدث المهني والنقاش الصوتي',
      subtitle: 'استمع للمتحدث الناطق وأعد الإلقاء بنبرة واثقة',
      mode: 'speaking',
      xpReward: 45,
    },
    {
      id: `st-l${level}-6`,
      order: 6,
      title: isMaster ? 'النص الأدبي والتقييم الصوتي الشامل' : 'تحليل النص المتقدم بالوسيلة الصوتية',
      subtitle: 'إعادة القراءة الصوتية وإتقان الفهم العميق',
      mode: 'reading',
      xpReward: 60,
    },
  ];
}
