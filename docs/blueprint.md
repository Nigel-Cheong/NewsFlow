# **App Name**: NewsGenius POC

## Core Features:

- Confidentiality Checker: Use Gemini 2.5 Pro Flash as a tool to scan the newsletter content for predefined sensitive keywords.
- Keyword Alert: Provide in-app alert when sensitive keywords are detected, highlighting the specific word/phrase.
- Issue To-Do List: Maintain a simple to-do list within the app to display the flagged sensitive issues for user review, with the issue's document location.
- Layout Auto-Selection: Automatically suggest a layout template (text-only, image-with-text, bullet points) based on the type of content.
- Manual Editing: Enable direct editing of text within the content blocks and the use of pre-made content blocks with drag-and-drop functionality for building newsletter structure.
- Basic Edit Controls: Implement basic controls (undo, redo, copy, paste) for editing content within the tool.
- Approval Workflow: Provide a simplified human-in-the-loop approval mechanism (Submit, Pending Approval, Approve/Reject) without actual sending.
- Data Ingestion: Retrieve JSON data from mock API which will contain text, tag ('general' or 'restricted'), and date of content creation.

## Style Guidelines:

- Primary color: Slate blue (#708090) for a professional, trustworthy feel.
- Background color: Very light gray (#F0F0F0), close to white, for a clean, distraction-free workspace.
- Accent color: Muted olive green (#808000) for a touch of sophistication, especially for calls to action and highlighted elements.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text, ensuring readability and a modern, neutral appearance.
- Use clear, professional icons for key actions (edit, save, send, approve, reject) with a consistent line weight and style.
- Maintain a clean and structured layout using a grid system to ensure content is well-organized and easily digestible.
- Use subtle transitions and animations for feedback and workflow processes (e.g., progress bars, status changes), avoiding any flashy or distracting effects.