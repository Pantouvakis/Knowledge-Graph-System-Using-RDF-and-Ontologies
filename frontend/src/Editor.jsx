import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import tinymce from 'tinymce';

function MyComponent({ id, initialValue, onChange }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    tinymce.init({
      selector: `textarea#${id}`,
      setup: editor => {
        editor.on('change', () => {
          const content = editor.getContent();
          onChange(content);
        });
      },
      menubar: false,
      toolbar: 'bullist, numlist',
      plugins: 'advlist',
      advlist_bullet_styles: 'square',
      advlist_number_styles: 'lower-alpha,lower-roman,upper-alpha,upper-roman',
      init_instance_callback: editor => {
        // Set initial value
        editor.setContent(initialValue);
      }
    });

    return () => {
      tinymce.remove(`textarea#${id}`);
    };
  }, [id, initialValue, onChange]);

  return (
    <div>
      <textarea ref={textareaRef} id={id} />
    </div>
  );
}

MyComponent.propTypes = {
  id: PropTypes.string.isRequired,
  initialValue: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default MyComponent;
