import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext'; // ייבוא הקונטקסט
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionEditor from './QuestionEditor';

// רכיב פנימי לתצוגה
function SortableQuestionItem({ question, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style} className="question-item" {...attributes}>
            <div style={{ display: 'flex', alignItems: 'center' }}><span {...listeners} className="drag-handle">☰</span><span><strong>{question.label}</strong> <span style={{ color: '#777' }}>({question.type})</span></span></div>
            <div><button onClick={() => onEdit(question.id)} className="btn btn-edit" style={{ marginLeft: '10px' }}>ערוך</button><button onClick={() => onDelete(question.id)} className="btn btn-delete">מחק</button></div>
        </div>
    );
}

function FormBuilder() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // קבלת המשתמש מהקונטקסט
  const [template, setTemplate] = useState({ name: 'שאלון חדש', questions: [] });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  
  useEffect(() => {
    if (templateId === 'new') {
      setTemplate({ name: 'שאלון חדש', questions: [] });
      setLoading(false);
      return;
    }
    const fetchTemplate = async () => {
      setLoading(true);
      const docRef = doc(db, 'questionnaireTemplates', templateId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTemplate({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("תבנית לא נמצאה.");
        navigate('/templates');
      }
      setLoading(false);
    };
    fetchTemplate();
  }, [templateId, navigate]);

  const handleAddQuestion = () => {
    const newQuestion = { id: uuidv4(), label: 'שאלה חדשה', type: 'text', required: false };
    setTemplate(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    setEditingQuestionId(newQuestion.id); 
  };
  
  const handleUpdateQuestion = (updatedQuestion) => {
    setTemplate(prev => ({...prev, questions: prev.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)}));
    setEditingQuestionId(null);
  };
  
  const handleDeleteQuestion = (id) => {
    if (window.confirm("למחוק שאלה זו?")) {
      setTemplate(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id)}));
    }
  };

  const handleSaveTemplate = async (saveAsNew = false) => {
    // --- בדיקת הרשאות בצד הלקוח ---
    console.log("Attempting to save. Current user:", currentUser);
    if (!currentUser) {
      alert("שגיאה: אינך מחובר.");
      return;
    }
    console.log("User's provider data:", currentUser.providerData);
    // --------------------------------

    setIsSaving(true);
    const dataToSave = { name: template.name, questions: template.questions, isActive: template.isActive ?? false };
    try {
      if (templateId === 'new' || saveAsNew) {
        const newDocRef = await addDoc(collection(db, 'questionnaireTemplates'), dataToSave);
        alert('השאלון החדש נשמר בהצלחה!');
        navigate(`/form-builder/${newDocRef.id}`);
      } else {
        const docRef = doc(db, 'questionnaireTemplates', templateId);
        await setDoc(docRef, dataToSave);
        alert('השינויים נשמרו בהצלחה!');
      }
    } catch (error) { console.error("Error saving template:", error); alert('שגיאה בשמירת השאלון.'); } 
    finally { setIsSaving(false); }
  };
  
  const handleDragEnd = (event) => {
    const {active, over} = event;
    if (over && active.id !== over.id) {
        const oldIndex = template.questions.findIndex(q => q.id === active.id);
        const newIndex = template.questions.findIndex(q => q.id === over.id);
        setTemplate(prev => ({ ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) }));
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (loading) return <div className="page-container"><p>טוען עורך...</p></div>;

  return (
    <div className="page-container">
      <h2>{templateId === 'new' ? 'יצירת שאלון חדש' : `עריכת שאלון: ${template.name}`}</h2>
      <div className="form-group">
        <label htmlFor="templateName">שם השאלון:</label>
        <input type="text" id="templateName" value={template.name} onChange={(e) => setTemplate(prev => ({...prev, name: e.target.value}))} />
      </div>
      <hr style={{margin: '2rem 0'}}/>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={template.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            {template.questions.map(q => (
              <div key={q.id}>
                {editingQuestionId === q.id ? (
                  <QuestionEditor question={q} onSave={handleUpdateQuestion} onCancel={() => setEditingQuestionId(null)} />
                ) : (
                  <SortableQuestionItem question={q} onDelete={handleDeleteQuestion} onEdit={() => setEditingQuestionId(q.id)} />
                )}
              </div>
            ))}
        </SortableContext>
      </DndContext>
      <div className="actions-bar" style={{ justifyContent: 'space-between' }}>
        <button onClick={handleAddQuestion} className="btn btn-add">הוסף שאלה</button>
        <div>
            <button onClick={() => handleSaveTemplate()} disabled={isSaving} className="btn btn-primary">
                {templateId === 'new' ? 'שמור שאלון חדש' : 'שמור שינויים'}
            </button>
            {templateId !== 'new' && (
                <button onClick={() => handleSaveTemplate(true)} disabled={isSaving} className="btn" style={{marginRight: '10px'}}>
                    שמור כעותק חדש
                </button>
            )}
        </div>
        <button onClick={() => navigate('/templates')} className="btn btn-cancel">חזור לרשימה</button>
      </div>
    </div>
  );
}

export default FormBuilder;
