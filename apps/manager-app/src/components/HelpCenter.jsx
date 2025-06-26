import React, { useState, useMemo } from 'react';

// =======================================================
// --- כאן נמצא כל התוכן של המדריך ---
// =======================================================
const helpTopics = [
  { 
    id: 'intro', 
    title: 'פתיחה למנהל', 
    content: 'ברוכים הבאים למערכת הניהול.\n\nמערכת זו מעניקה לך שליטה מלאה על תהליך השאלונים. כאן תוכל ליצור ולנהל תבניות שאלונים, לצפות בכל השאלונים שמולאו על ידי המראיינים, לטפל בשאלונים עם פרטים שגויים, ולייצא נתונים לשימוש חיצוני.' 
  },
  { 
    id: 'dashboard', 
    title: 'דשבורד השאלונים', 
    content: 'דף הבית ("שאלונים שמולאו") הוא מרכז הבקרה שלך לצפייה בנתונים.\n\n- בחירת תבנית: השתמש בתפריט ה-dropdown כדי להציג רק שאלונים ששייכים לתבנית מסוימת.\n- חיפוש: הקלד בשדה החיפוש כדי לסנן את הרשימה בזמן אמת לפי שם, ת.ז. או שם מראיין.\n- מיון: לחץ על כותרת של עמודה כדי למיין את הטבלה. לחיצה נוספת הופכת את סדר המיון.\n- ייצוא לאקסל: כפתור זה יוריד קובץ Excel המכיל את כל הנתונים המוצגים כרגע בטבלה.' 
  },
  { 
    id: 'templates', 
    title: 'ניהול תבניות', 
    content: 'כאן אתה שולט בשאלונים שהמראיינים יכולים להשתמש בהם.\n\n- יצירת תבנית: לחץ על "+ צור שאלון חדש" כדי לעבור לעורך וליצור תבנית מאפס.\n- עריכת תבנית: לחץ על "ערוך" ליד תבנית קיימת כדי לשנות את שמה, להוסיף/להסיר שאלות, או לשנות את סדרן.\n- הפעלה/השבתה: רק תבניות המסומנות כ"פעיל" יופיעו אצל המראיינים. השתמש בכפתור המתאים כדי לשלוט בנראות של כל תבנית.' 
  },
  { 
    id: 'form-builder', 
    title: 'עורך השאלונים', 
    content: 'עורך השאלונים הוא כלי רב עוצמה לבניית הטפסים שלך.\n\n- סוגי שאלות: ניתן לבחור סוגים שונים כמו טקסט קצר, פסקה, בחירה יחידה (רדיו) או בחירה מרובה (צ\'קבוקס).\n- הצגה בדשבורד: עבור שאלות מסוג "רדיו", ניתן לסמן את התיבה "הצג כעמודה בדשבורד". זה יוסיף עמודה חדשה לטבלה הראשית עם התשובות לשאלה זו, ויאפשר לך לראות נתונים חשובים במבט מהיר.' 
  },
  { 
    id: 'exceptions', 
    title: 'טיפול בחריגות', 
    content: 'דף זה מרכז את כל השאלונים שנשמרו על ידי מראיינים עם תעודת זהות שגויה.\n\n- תהליך התיקון: עבור כל פריט, הזן את תעודת הזהות הנכונה בשדה המיועד.\n- בדיקות אוטומטיות: המערכת תבדוק שהת.ז. החדשה תקינה אלגוריתמית ושהיא לא קיימת כבר במערכת.\n- אישור והעברה: לחיצה על "תקן והעבר" תעביר את השאלון המתוקן לרשימה הראשית ותמחק אותו מרשימת החריגות.' 
  },
  { 
    id: 'details', 
    title: 'פרטי שאלון בודד', 
    content: 'לחיצה על שם מרואיין בדשבורד תוביל לדף המציג את כל פרטי השאלון.\n\n- עריכה: לחץ על "ערוך שאלון" כדי לעדכן את כל הפרטים (מלבד ת.ז.).\n- הערות מנהל: ניתן להוסיף הערות אישיות או הנחיות להמשך טיפול בשדה המיועד.\n- פעולות נוספות: ניתן למחוק את השאלון לצמיתות, להדפיס אותו, או לשלוח את תוכנו במייל.' 
  },
];

function HelpCenter({ onClose }) {
  const [activeTopicId, setActiveTopicId] = useState(helpTopics[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return helpTopics;
    const lowercasedTerm = searchTerm.toLowerCase();
    return helpTopics.filter(topic => 
      topic.title.toLowerCase().includes(lowercasedTerm) ||
      topic.content.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm]);

  const activeTopic = helpTopics.find(topic => topic.id === activeTopicId) || filteredTopics[0];

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="help-modal-close-btn">×</button>
        
        <div className="help-modal-grid">
          <div className="help-modal-sidebar">
            <h3>מרכז העזרה</h3>
            <input 
              type="text" 
              placeholder="חפש נושא..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{marginBottom: '1rem', width: '100%'}}
            />
            <ul>
              {filteredTopics.map(topic => (
                <li 
                  key={topic.id} 
                  className={topic.id === activeTopicId ? 'active' : ''}
                  onClick={() => setActiveTopicId(topic.id)}
                >
                  {topic.title}
                </li>
              ))}
אתה צודק לחלוטין. בקוד שסיפקתי, שמתי רק דוגמאות קצרות.

הטקסט המלא של המדריך נשמר ישירות בתוך הקובץ **`HelpCenter.jsx`**, במערך שנקרא `helpTopics`.

בוא נמלא אותו עכשיו עם כל התוכן המלא והמפורט שבנינו יחד.

---

### קובץ מלא וסופי: `apps/manager-app/src/components/HelpCenter.jsx`

הנה הקובץ המלא. פשוט החלף את כל התוכן של הקובץ הקיים שלך בקוד הזה.

```jsx
import React, { useState, useMemo } from 'react';

// =======================================================
// --- כאן נמצא כל התוכן של המדריך ---
// =======================================================
const helpTopics = [
  { 
    id: 'intro', 
    title: 'פתיחה למנהל', 
    content: 'ברוכים הבאים למערכת הניהול.\n\nמערכת זו מעניקה לך שליטה מלאה על תהליך השאלונים. כאן תוכל ליצור ולנהל תבניות שאלונים, לצפות בכל השאלונים שמולאו על ידי המראיינים, לטפל בחריגות שדווחו, ולייצא נתונים לשימוש חיצוני.' 
  },
  { 
    id: 'dashboard', 
    title: 'דשבורד השאלונים', 
    content: 'דף הבית ("שאלונים שמולאו") הוא מרכז הבקרה הראשי שלך לצפייה בנתונים.\n\n- בחירת תבנית: השתמש בתפריט ה-dropdown בראש הדף כדי להציג רק שאלונים ששייכים לתבנית מסוימת.\n- חיפוש חופשי: הקלד בשדה החיפוש כדי לסנן את הרשימה בזמן אמת לפי שם מרואיין, ת.ז., או שם מראיין.\n- מיון: לחץ על כותרת של עמודה (למשל, "מועד הגשה") כדי למיין את הטבלה. לחיצה נוספת תהפוך את סדר המיון.\n- ייצוא לאקסל: לחץ על הכפתור כדי להוריד קובץ Excel המכיל את כל הנתונים המוצגים כרגע בטבלה.' 
  },
  { 
    id: 'templates', 
    title: 'ניהול תבניות', 
    content: 'בדף זה ניתן לנהל את מאגר השאלונים הזמינים למראיינים.\n\n- יצירת תבנית חדשה: לחץ על "+ צור שאלון חדש" כדי לעבור לעורך השאלונים ולהתחיל תבנית מאפס.\n- עריכת תבנית קיימת: לחץ על "ערוך" ליד התבנית הרצויה כדי לשנות את שמה, להוסיף/למחוק שאלות, או לשנות את סדרן.\n- הפעלה והשבתה: השתמש בכפתור שליד כל תבנית כדי לשנות את הסטטוס שלה. רק תבניות המסומנות כ"פעיל" יופיעו אצל המראיינים בדף בחירת השאלון.' 
  },
  { 
    id: 'form-builder', 
    title: 'עורך השאלונים', 
    content: 'עורך השאלונים הוא כלי רב עוצמה ליצירת טפסים דינמיים.\n\n- סוגי שאלות: ניתן לבחור סוגים שונים של שאלות, כולל טקסט, פסקה, בחירה יחידה (רדיו) ובחירה מרובה (צ\'קבוקס).\n- הצגה בדשבורד: עבור שאלות מסוג "רדיו", ניתן לסמן את התיבה "הצג כעמודה בדשבורד". התשובה לשאלה זו תופיע כעמודה נפרדת בטבלה הראשית, מה שמאפשר ניתוח מהיר של נתונים חשובים.' 
  },
  { 
    id: 'exceptions', 
    title: 'טיפול בחריגות', 
    content: 'כאן מופיעים כל השאלונים שנשמרו על ידי מראיינים עם ת.ז. שגויה (באורך לא תקין או לא תקינה אלגוריתמית).\n\n- תהליך התיקון: עבור כל פריט, הזן את תעודת הזהות הנכונה בשדה המתאים ולחץ על "תקן והעבר".\n- תוצאה: הפעולה תעביר את השאלון המתוקן לרשימה הראשית (תחת הת.ז. החדשה) ותמחק אותו מרשימת החריגות.' 
  },
  { 
    id: 'details', 
    title: 'פרטי שאלון בודד', 
    content: 'לחיצה על שם מרואיין בדשבורד תוביל לדף המציג את כל פרטי השאלון.\n\n- עריכה: לחץ על "ערוך שאלון" כדי לעדכן את כל הפרטים (מלבד ת.ז.).\n- הערות מנהל: ניתן להוסיף הערות והנחיות בשדה המיועד לכך.\n- פעולות נוספות: ניתן למחוק את השאלון, להדפיס אותו, או לשלוח אותו במייל כתקציר טקסט.' 
  },
];

function HelpCenter({ onClose }) {
  const [activeTopicId, setActiveTopicId] = useState(helpTopics[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return helpTopics;
    const lowercasedTerm = searchTerm.toLowerCase();
    return helpTopics.filter(topic => 
      topic.title.toLowerCase().includes(lowercasedTerm) ||
      topic.content.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm]);

  const activeTopic = helpTopics.find(topic => topic.id === activeTopicId) || filteredTopics[0];

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="help-modal-close-btn">×</button>
        
        <div className="help-modal-grid">
          <div className="help-modal-sidebar">
            <h3>מרכז העזרה</h3>
            <input 
              type="text" 
              placeholder="חפש נושא..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{marginBottom: '1rem', width: '100%'}}
            />
            <ul>
              {filteredTopics.map(topic => (
                <li 
                  key={topic.id} 
                  className={topic.id === activeTopicId ? 'active' : ''}
                  onClick={() => setActiveTopicId(topic.id)}
                >
                  {topic.title}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="help-modal-main">
            {activeTopic ? (
              <>
                <h2>{activeTopic.title}</h2>
                {/* שימוש ב-split ו-map כדי להציג כל שורה בפסקה נפרדת */}
                {activeTopic.content.split('\n').map((paragraph, index) => (
                  <p key={index} style={{whiteSpace: 'pre-wrap', margin: '0 0 1em 0'}}>
                    {paragraph}
                  </p>
                ))}
              </>
            ) : (
              <p>לא נמצאו תוצאות לחיפוש.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
