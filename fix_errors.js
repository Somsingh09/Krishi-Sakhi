
const fs = require("fs");

function fix(file) {
    let content = fs.readFileSync(file, "utf8");
    content = content.replace(/mandiLocBtn\.innerHTML = '<i class=" fa-solid fa-spinner fa-spin><\/i>;/g, "mandiLocBtn.innerHTML = '<i class=\"fa-solid fa-spinner fa-spin\"></i>';");
    content = content.replace(/mandiLocBtn\.innerHTML = '<i class=" fa-solid fa-magnifying-glass-location><\/i>;/g, "mandiLocBtn.innerHTML = '<i class=\"fa-solid fa-magnifying-glass-location\"></i>';");
    
    // For dashboard.js
    content = content.replace(/mandi: 'What are today\\\\'s mandi rates\?',/g, "mandi: 'What are today\\\\'s mandi rates?',");
    
    fs.writeFileSync(file, content, "utf8");
}
fix("script.js");
fix("dashboard.js");

