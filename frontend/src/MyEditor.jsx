import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

function MyEditor({ value, onEditorChange }) {
  return (
    <Editor
      apiKey="YOUR_API_KEY"
      value={value}
      initialValue="<p>This is the initial content of the editor</p>"
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help'
      }}
      onEditorChange={(content) => onEditorChange(content)}
    />
  );
}

export default MyEditor;
