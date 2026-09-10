const { formatParakeetAnswer, parseAnswerSections } = require('../src/lib/answerFormatter.js');

const raw = `[TYPE] other  
[POINTS]  
- No specific experience to share  
- Focus on general frontend skills  
- Emphasize problem-solving abilities  
- Highlight collaboration with teams  
- Discuss adaptability to new technologies  
- Mention commitment to user experience  

[ANSWER] I don’t have a specific experience to share, but I can talk about my general skills in frontend development. I focus on creating responsive and user-friendly interfaces that enhance user experience. My task often involves collaborating with design and backend teams to ensure seamless integration. I adapt quickly to new technologies and frameworks, which helps me stay current in the field. I prioritize problem-solving, addressing issues as they arise during development. I also measure success through user feedback and performance metrics, ensuring that the final product meets user needs effectively. Overall, my commitment to delivering high-quality frontend solutions drives my work.`;

console.log('PARSED:', JSON.stringify(parseAnswerSections(raw), null, 2));
console.log('OUTPUT HTML:\n', formatParakeetAnswer(raw));
