// בתוך FormBuilder.jsx או בקובץ QuestionEditor.jsx

function QuestionEditor({ question, onSave, onCancel }) {
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
      {/* ... שדה כותרת, שדה סוג שאלה ... */}
      
      {/* --- הוספת תיבת הסימון החדשה --- */}
      {/* תוצג רק אם סוג השאלה הוא 'radio' */}
      {editedQuestion.type === 'radio' && (
        <div className="form-group-inline" style={{marginTop: '1rem', padding: '10px', background: '#e9ecef', borderRadius: '5px'}}>
          <input
            type="checkbox"
            id="showInDashboard"
            name="showInDashboard"
            // השתמש ב-!! כדי להמיר ערך (שיכול להיות undefined) לבוליאני
            checked={!!editedQuestion.showInDashboard}
            onChange={handleChange}
          />
          <label htmlFor="showInDashboard" style={{fontWeight: 'bold'}}>הצג כעמודה בדשבורד הראשי</label>
        </div>
      )}
      {/* ------------------------------------ */}

      {(editedQuestion.type === 'radio' || editedQuestion.type === 'checkbox') && (
        <div className="form-group">
          <label>אפשרויות (מופרדות בפסיק):</label>
          <input type="text" id="options" name="options" value={(editedQuestion.options || []).join(', ')} onChange={handleOptionsChange} />
        </div>
      )}

      <div className="form-group-inline">
        <input type="checkbox" id="required" name="required" checked={!!editedQuestion.required} onChange={handleChange} />
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
