import Head from "next/head";
import { useReducer, useRef, useState } from "react";
import styles from "./index.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import dynamic from "next/dynamic";

export default function Home() {
  const editorRef = useRef();
  const Editor = dynamic(() => import("../components/MyEditor"), {
    ssr: false,
  });
  const [topicInput, setTopicInput] = useState("");
  const [rewriteInput, setRewriteInput] = useState("");
  const [result, setResult] = useState("");
  const [sectionResult, setSectionResult] = useState("");
  const [isResultLoading, setIsResultLoading] = useState(false);
  const [isSectionLoading, setIsSectionLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setIsResultLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topicInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(data.result);
      setIsResultLoading(false);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      setIsResultLoading(false);
      alert(error.message);
    }
  }

  async function onSuggest(event) {
    event.preventDefault();
    try {
      setIsSectionLoading(true);
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: result }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setSectionResult(data.result);
      setIsSectionLoading(false);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      setIsSectionLoading(false);
      alert(error.message);
    }
  }

  async function generateSuggestion(section) {
    try {
      const editor = editorRef.current.editor;
      const response = await fetch("/api/suggestGenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topicInput, suggestion: section }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      editor.model.change((writer) => {
        const insertPosition =
          editor.model.document.selection.getFirstPosition();
        const content = data.result;
        const viewFragment = editor.data.processor.toView(content);
        const modelFragment = editor.data.toModel(viewFragment);

        editor.model.insertContent(modelFragment, insertPosition);
      });
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onRewrite(event) {
    event.preventDefault();
    const editor = editorRef.current.editor;
    const selection = editor.model.document.selection;
    const range = selection.getFirstRange();
  }

  return (
    <div>
      <Head>
        <title>Genearting Draft</title>
      </Head>

      <main className={styles.main}>
        <div className="row" style={{ width: "100%" }}>
          <div className="col-6">
            <h3>What are you writing?</h3>
            <form onSubmit={onSubmit}>
              <input
                type="text"
                name="topic"
                placeholder="A detailed description of the document you're creating"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
              />
              <input type="submit" value="Generate Draft" />
            </form>

            {isResultLoading ? (
              <div class="spinner-border" role="status"></div>
            ) : (
              <Editor
                value={result}
                onChange={() => {}}
                editorRef={editorRef}
              />
            )}
          </div>
          <div className="col-6">
            <h3>What to write next?</h3>
            <form onSubmit={onSuggest}>
              <input type="submit" value="Suggest" />
            </form>
            {isSectionLoading ? (
              <div class="spinner-border" role="status"></div>
            ) : (
              <table className="table">
                <tbody>
                  {sectionResult
                    .split(/\d+\.\s+/)
                    .filter((section) => section.length > 0)
                    .map((section, index) => (
                      <tr key={index}>
                        <td>{section}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => generateSuggestion(section)}
                          >
                            Generate
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            {/* 
            <form onSubmit={onRewrite}>
              <h3>Re-write selected text</h3>
              <input
                type="text"
                name="topic"
                placeholder="A detailed description of the document you're creating"
                value={rewriteInput}
                onChange={(e) => setRewriteInput(e.target.value)}
              />
              <input type="submit" value="ReWrite" />
            </form> */}
          </div>
        </div>
      </main>
    </div>
  );
}
