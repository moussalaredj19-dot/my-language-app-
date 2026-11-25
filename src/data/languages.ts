export interface LanguageOption {
  id: string;
  nameAr: string;
  nativeName: string;
  bcp47: string;
  scriptSample: string;
  code: string;
}

export const WORLD_LANGUAGES: LanguageOption[] = [
  { id: 'ar', nameAr: 'العربية', nativeName: 'العربية', bcp47: 'ar-SA', scriptSample: 'ض', code: 'AR' },
  { id: 'fr', nameAr: 'الفرنسية', nativeName: 'Français', bcp47: 'fr-FR', scriptSample: 'Éé', code: 'FR' },
  { id: 'en', nameAr: 'الإنجليزية', nativeName: 'English', bcp47: 'en-US', scriptSample: 'Aa', code: 'EN' },
  { id: 'ru', nameAr: 'الروسية', nativeName: 'Русский', bcp47: 'ru-RU', scriptSample: 'Ж', code: 'RU' },
  { id: 'it', nameAr: 'الإيطالية', nativeName: 'Italiano', bcp47: 'it-IT', scriptSample: 'Àà', code: 'IT' },
  { id: 'es', nameAr: 'الإسبانية', nativeName: 'Español', bcp47: 'es-ES', scriptSample: 'Ññ', code: 'ES' },
  { id: 'pt', nameAr: 'البرتغالية', nativeName: 'Português', bcp47: 'pt-PT', scriptSample: 'Ãã', code: 'PT' },
  { id: 'de', nameAr: 'الألمانية', nativeName: 'Deutsch', bcp47: 'de-DE', scriptSample: 'Üü', code: 'DE' },
];

export function getLanguageByName(name: string): LanguageOption {
  const found = WORLD_LANGUAGES.find(
    (l) =>
      l.nameAr === name ||
      l.nativeName.toLowerCase() === name.toLowerCase() ||
      l.id === name.toLowerCase()
  );
  if (found) return found;
  return WORLD_LANGUAGES[2];
}

export function getLanguageSpeechCode(name: string): string {
  return getLanguageByName(name).bcp47;
}

export interface LevelDefinition {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  cefr: string;
  description: string;
  curriculumFocus: string;
}

export const PROFICIENCY_LEVELS: LevelDefinition[] = [
  {
    level: 1,
    label: 'مبتدئ',
    cefr: 'A1',
    description: 'أبدأ من الصفر: الحروف، النطق باللغة المعاكسة، وكتابة الكلمات الأساسية.',
    curriculumFocus: 'مراحل تأسيسية متدرجة للأبجدية، النطق تحت كل حرف، وكتابة الكلمات مع شرح معناها.',
  },
  {
    level: 2,
    label: 'اعرف بعض الكلمات',
    cefr: 'A2',
    description: 'أفهم كلمات متفرقة وأحتاج لتكوين جمل قصيرة مترابطة.',
    curriculumFocus: 'مراحل بناء الجمل اليومية: ربط الأفعال، مواقف السفر والمقهى، والتمارين الصوتية.',
  },
  {
    level: 3,
    label: 'متوسط',
    cefr: 'B1',
    description: 'أستطيع خوض محادثات بسيطة وأرغب في تطوير الطلاقة والقواعد.',
    curriculumFocus: 'مراحل التوسع المتدرجة: الأزمنة المركبة، التعبير عن الآراء، وفهم الفقرات المتوسطة.',
  },
  {
    level: 4,
    label: 'متقدم',
    cefr: 'B2',
    description: 'أتواصل بثقة وأسعى لإتقان التعابير الاصطلاحية والنقاشات المهنية.',
    curriculumFocus: 'مراحل الاحتراف: صياغة نصوص متقنة، المناظرات، والتعابير الثقافية الدقيقة.',
  },
  {
    level: 5,
    label: 'ممتاز',
    cefr: 'C1/C2',
    description: 'مستوى عالٍ جداً: أستهدف الإتقان البلاغي واللغوي الكامل كأهل اللغة.',
    curriculumFocus: 'مراحل الإتقان الأعلى: البلاغة، المصطلحات التخصصية، والتقييم الصوتي الدقيق.',
  },
];

export interface PurposeOption {
  id: string;
  label: string;
  summary: string;
  question1: string;
  options1: string[];
  question2: string;
  options2: string[];
}

export const LEARNING_PURPOSES: PurposeOption[] = [
  {
    id: 'travel',
    label: 'السفر والسياحة',
    summary: 'التنقل في المطارات، الفنادق، المطاعم، والتعامل بثقة مع السكان.',
    question1: 'ما أكثر موقف تحتاجه أثناء السفر؟',
    options1: ['المطار والفنادق', 'المطاعم والتسوق', 'الاتجاهات والمواصلات', 'كل المواقف السياحية'],
    question2: 'متى تخطط لرحلتك القادمة؟',
    options2: ['خلال أقل من شهر', 'خلال 3 إلى 6 أشهر', 'تخطيط مستقبلي مفتوح'],
  },
  {
    id: 'work',
    label: 'العمل والأعمال',
    summary: 'مقابلات العمل، الاجتماعات الاحترافية، وكتابة رسائل البريد الرسمي.',
    question1: 'ما طبيعة استخدامك المهني للغة؟',
    options1: ['الاجتماعات والعروض التقديمية', 'المراسلات والتقارير المكتوبة', 'مقابلات العمل والتوظيف', 'التعامل مع العملاء الدوليين'],
    question2: 'ما مجالك المهني الرئيسي؟',
    options2: ['التقنية والهندسة', 'الإدارة والتجارة', 'الطب والعلوم', 'التعليم والإعلام'],
  },
  {
    id: 'study',
    label: 'الدراسة والمنح',
    summary: 'قراءة المراجع الأكاديمية، كتابة الأبحاث، واجتياز اختبارات اللغة.',
    question1: 'ما أولويتك الدراسية الحالية؟',
    options1: ['فهم المحاضرات والمقالات', 'الاستعداد لاختبار دولي', 'كتابة الأبحاث والتقارير', 'المناقشة داخل الصف'],
    question2: 'هل لديك اختبار محدد قريباً؟',
    options2: ['نعم، خلال أشهر قليلة', 'أحضّر للدراسة الجامعية', 'تطوير أكاديمي مستمر'],
  },
  {
    id: 'daily',
    label: 'التواصل اليومي',
    summary: 'تكوين صداقات عالمية، فهم الحياة اليومية، والتحدث بعفوية.',
    question1: 'كيف تفضل ممارسة التواصل اليومي؟',
    options1: ['المحادثات الصوتية السريعة', 'الرسائل النصية والاجتماعية', 'التعارف والحوارات العامة', 'جميع ما سبق'],
    question2: 'كم دقيقة تخصص للتدرب يومياً؟',
    options2: ['10 دقائق مركزة', '20 دقيقة متوازنة', '30 دقيقة فأكثر'],
  },
  {
    id: 'culture',
    label: 'الثقافة والأدب والفنون',
    summary: 'مشاهدة الأفلام والبودكاست وفهم الكتب والثقافة دون ترجمة.',
    question1: 'ما المحتوى الذي تستمتع به أكثر؟',
    options1: ['الأفلام والمسلسلات', 'الكتب والروايات', 'البودكاست والأخبار', 'التاريخ والفنون'],
    question2: 'هل تفضل التركيز على اللهجة أم الفصحى/المعيارية؟',
    options2: ['اللغة المعيارية الواضحة', 'اللهجة الدارجة والمحادثة الحية', 'مزيج متوازن'],
  },
  {
    id: 'relocation',
    label: 'الإقامة والهجرة',
    summary: 'الاندماج في بلد جديد وإنجاز المعاملات الرسمية والصحية والسكن.',
    question1: 'ما أهم المعاملات التي تستعد لها؟',
    options1: ['الإجراءات الحكومية والبنوك', 'السكن والخدمات اليومية', 'الصحة والمستشفيات', 'الاندماج الاجتماعي الشامل'],
    question2: 'هل تقيم حالياً في بلد يتحدث هذه اللغة؟',
    options2: ['نعم، أعيش هناك حالياً', 'أستعد للانتقال قريباً', 'تخطيط للسنوات القادمة'],
  },
];
