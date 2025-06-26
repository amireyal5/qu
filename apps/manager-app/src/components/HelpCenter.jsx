import React, { useState, useMemo } from 'react';

// נגדיר את כל תוכן המדריך כאן בקובץ אחד
const helpTopics = [
  { id: 'intro', title: 'פתיחה', content: 'ברוכים הבאים למערכת הניהול. כאן תוכלו לנהל תבניות, לצפות בשאלונים ולטפל בחריגות.' },
  { id: 'dashboard', title: 'דשבורד השאלונים', content: 'דף הבית מציג את כל השאלונים התקינים. ניתן לסנן לפי תבנית, לחפש, למיין את העמודות ולייצא לאקסל.' },
  { id: 'templates', title: 'ניהול תבניות', content: 'בדף זה ניתן ליצור תבניות חדשות, לערוך קיימות, ולהגדיר אילו מהן יהיו פעילות עבור המראיינים.' },
  { id: 'exceptions', title: 'טיפול בחריגות', content: 'כאן מופיעים שאלונים שנשמרו עם ת.ז. שגויה. יש לתקן את הת.ז. וללחוץ "תקן והעבר" כדי להעבירם לרשימה הראשית.' },
  // ... הוסף כאן את כל שאר הנושאים מהמדריך
];

function HelpCenter({ onClose }) {
  const [activeTopicId, setActiveTopicId] = useState(helpTopics[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return helpTopics;
    return helpTopics.filter(topic => 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const activeTopic = helpTopics.find(topic => topic.id === activeTopicId);

  return (
    // הרקע האפור שמכסה את כל המסך
    <div className="help-modal-overlay" onClick={onClose}>
      {/* החלון עצמו - e.stopPropagation() מונע סגירה בלחיצה עליו */}
      <div className="רעיון מצוין. שילוב מדריך כזה ישירות במערכת משפר מאוד את חווית המשתמש ומקטין את הצורך בתמיכה.

        help-modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="help-modal-close-btn">×</button>
        
        <div className="help-modal-grid">
          {/* עמודת הניווט */}
          <div className="help-modal-sidebar">
            <h3>מרכז העזרה</h3>
            <input 
              type="text" 
              placeholder="חפש נושא..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{marginBottom: '1rem'}}
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
          
          {/* עמודת התוכן */}
          <div className="help-modal-main">
            <h2>{activeTopic.title}</h2>
            <p style={{whiteSpace: 'pre-wrap'}}>{activeTopic.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
