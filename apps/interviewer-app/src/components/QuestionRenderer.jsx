import React from 'react';

function QuestionRenderer({ question, value, onChange, onCheckboxChange }) {
  // פירוק המאפיינים מהאובייקט question
  const { id, label, type, required, options = [] } = question;

  // פונקציית עזר קטנה להצגת התווית
  const renderLabel = () => (
    <label htmlFor={id}>{label}{required && ' *'}</label>
  );

  switch (type) {
    case 'text':
      return (
        <div className="form-group">
          {renderLabel()}
          <input
            type="text"
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            required={!!required}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="form-group">
          {renderLabel()}
          <textarea
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            required={!!required}
            rows="5"
          />
        </div>
      );

    case 'radio':
      return (
        <div className="form-group">
          {renderLabel()}
          <div className="radio-group">
            {options.map((option, index) => (
              <div key={`${id}-${index}`} className="radio-option">
                <input
                  type="radio"
                  id={`${id}-${option}`}
                  name={id}
                  value={option}
                  checked={value === option}
                  onChange={onChange}
                  required={!!required}
                />
                <label htmlFor={`${id}-${option}`}>{option}</label>
              </div>
            ))}
          </div>
        </div>
      );

    case 'checkbox':
      return (
        <div className="form-group">
          {renderLabel()}
          <div className="checkbox-group">
            {options.map((option, index) => (
              <div key={`${id}-${index}`} className="checkbox-option">
                <input
                  type="checkbox"
                  id={`${id}-${option}`}
                  name={id}
                  value={option}
                  checked={(Array.isArray(value) && value.includes(option))}
                  onChange={onCheckboxChange}
                />
                <label htmlFor={`${id}-${option}`}>{option}</label>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="form-group validation-message error">
          <p>סוג שאלה לא נתמך: {type}</p>
        </div>
      );
  }
}

export default QuestionRenderer;