import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React, { useState } from "react";

const Editor = ({ value, onChange, editorRef }) => {
  return (
    <CKEditor
      config={{ height: "500px" }}
      editor={ClassicEditor}
      data={value}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
      ref={editorRef}
    />
  );
};

export default Editor;
