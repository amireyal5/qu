// manager-app/src/components/QuestionEditor.jsx
import React, { useState, useEffect } from 'react';

function QuestionEditor({ question, onSave, onCancel }) {
  // ניצור עותק מקומי של השאלה כדי שהשינויים לא ישפיעו על הרשימה עד שנשמור
  const [editedQuestion, setEditedQuestion] = useState(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedQuestion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleOptionsChange = (e) => {
    // המרת מחרוזת מופרדת בפסיקים למערך של אפשרויות
    const optionsArray = e.target.value.split(',').map(opt => opt.trim());
    setEditedQuestion(prev => ({ ...prev, options: optionsArray }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(editedQuestion);
  };

  return (
    <form onSubmit={handleSave} className="question-editor">
      <h4>עריכת שאלה</h4>
      <div className="form-group">
        <label htmlFor="label">כותרת השאלה:</label>
        <input
          type="text"
          id="label"
          name="label"
          value={editedQuestion.label}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="type">סוג השאלה:</label>
        <select
          id="type"
          name="type"
          value={editedQuestion.type}
          onChange={handleChange}
        >
          <option value="text">טקסט קצר</option>
          <option value="textarea">פסקה (טקסט ארוך)</option>
          <option value="radio">בחירה יחידה (רדיו)</option>
          <option value="checkbox">בחירה מרובה (צ'קבוקס)</option>
        </select>
      </div>

      {/* הצג שדה לאפשרויות רק אם סוג השאלה הוא רדיו או צ'קבוקס */}
      {(editedQuestion.type === 'radio' || editedQuestion.type === 'checkbox') && (
        <div className="form-group">
          <label htmlFor="options">אפשרויות (מופרדות בפסיק):</label>
          <input
            type="text"
            id="options"
            name="options"
            value={(editedQuestion.options || []).join(', ')}
            onChange={handleOptionsChange}
            placeholder="אפשרות 1, אפשרות 2, אפשרות 3"
          />
        </div>
      )}

      <div className="form-group-inline">
        <input
          type="checkbox"
          id="required"
          name="required"
          checked={!!editedQuestion.required}
          onChange={handleChange}
        />
        <label htmlFor="required">שאלת חובה</label>
      </div>

      <div className="actions-bar">
        <button type="submit" className="btn-save">שמור שינויים</button>
        <button type="button" onClick={onCancel} className="btn-cancel">בטל</button>
      </div>
    </form>
  );
}

export default QuestionEditor;