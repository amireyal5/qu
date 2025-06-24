// src/components/GovernmentSeal.jsx
import React from 'react';

// סגנון ה-inline נועד לשמור על העיצוב של הסמל צמוד לרכיב עצמו
const sealStyle = {
  width: '70px',
  height: 'auto',
  marginBottom: '20px',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const GovernmentSeal = () => (
  <svg
    style={sealStyle}
    viewBox="0 0 1200 1543.2"
    xmlns="http://www.w3.org/2000/svg"
    fill="var(--primary-blue, #004a99)" // ישתמש בצבע הכחול הראשי מה-CSS
  >
    {/* כאן יופיע קוד ה-SVG של סמל המדינה */}
    <path d="M600 0L241.9 235.8 286.1 487.8 0 600 286.1 712.2 241.9 964.2 600 1200 958.1 964.2 913.9 712.2 1200 600 913.9 487.8 958.1 235.8 600 0z m0 1543.2l-358.1-235.8-44.2-252L0 900l286.1-112.2L241.9 535.8 600 300l358.1 235.8-44.2 252L1200 900l-286.1 112.2 44.2 252L600 1543.2z M450 675h300v150H450z M412.5 637.5h375v225h-375z M525 450h150v150H525z M487.5 412.5h225v225h-225z M600 225l75 150h-150z M562.5 187.5l112.5 225h-225z M600 975l75 150h-150z M562.5 937.5l112.5 225h-225z M300 600l150 75v-150z M262.5 562.5l225 112.5v-225z M900 600l-150 75v-150z M862.5 562.5l-225 112.5v-225z"/>
  </svg>
);

export default GovernmentSeal;