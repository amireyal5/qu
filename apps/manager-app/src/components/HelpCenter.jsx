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

  const activeTopic =
    helpTopics.find(topic => topic.id === activeTopicId) || filteredTopics[0];

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="help-modal-close-btn">×</button>

        <div className="help-modal-grid">
          <div className="help-modal-sidebar">
            <h3>מרכז העזרה</h3>
            <input
              type="text"
              placeholder="חפש נושא..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: '1rem', width: '100%' }}
            />

            {filteredTopics.length > 0 ? (
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
            ) : (
              <p style={{ padding: '1rem', color: '#888' }}>
                לא נמצאו נושאים מתאימים.
              </p>
            )}
          </div>

          <div className="help-modal-main">
            {activeTopic ? (
              <>
                <h2>{activeTopic.title}</h2>
                {activeTopic.content.split('\n').map((paragraph, index) => (
                  <p
                    key={index}
                    style={{
                      whiteSpace: 'pre-wrap',
                      margin: '0 0 1em 0',
                    }}
                  >
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
