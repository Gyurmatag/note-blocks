"use client";

import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import {
  BlockNoteView,
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems, SuggestionMenuController,
  useCreateBlockNote
} from "@blocknote/react";
import "@blocknote/core/style.css";
import { ImMagicWand } from "react-icons/im";
import { useCompletion } from "ai/react";
import { createNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import '@blocknote/core/fonts/inter.css';
import '@blocknote/react/style.css';

export default function TextEditor() {
  const { complete } = useCompletion({
    id: 'note_blocks',
    api: '/api/generate',
    onResponse: (response) => {
      if (response.status === 429) {
        return;
      }
      if (response.body) {
        const reader = response.body.getReader();
        let decoder = new TextDecoder();

        reader.read().then(function processText({ done, value }) {
          if (done) {
            return;
          }

          let chunk = decoder.decode(value, { stream: true });

          editor?._tiptapEditor.commands.insertContent(chunk);

          reader.read().then(processText);
        });
      } else {
        console.error('Response body is null');
      }
    },
    onError: (e) => {
      console.error(e.message);
    },
  });

  const insertMagicAi = (editor: BlockNoteEditor) => {
    const prevText = editor._tiptapEditor.state.doc.textBetween(
        Math.max(0, editor._tiptapEditor.state.selection.from - 5000),
        editor._tiptapEditor.state.selection.from - 1,
        '\n'
    );
    complete(prevText);
  };

  const insertMagicItem = (editor: BlockNoteEditor) => ({
    title: 'Insert Magic Text',
    onItemClick: async () => {
      const prevText = editor._tiptapEditor.state.doc.textBetween(
          Math.max(0, editor._tiptapEditor.state.selection.from - 5000),
          editor._tiptapEditor.state.selection.from - 1,
          '\n'
      );
      insertMagicAi(editor);
    },
    aliases: ['autocomplete', 'ai'],
    group: 'AI',
    icon: <ImMagicWand size={18} />,
    subtext: 'Continue your note with AI-generated text',
  });

  const getCustomSlashMenuItems = (
      editor: BlockNoteEditor
  ): DefaultReactSuggestionItem[] => [
    ...getDefaultReactSlashMenuItems(editor),
    insertMagicItem(editor),
  ];

  const editor = useCreateBlockNote({
  });

  const handleSubmitNote = async () => {
    const note = {
      document: editor.document
    }
    await createNote(note)
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 w-full">
      <div className="w-full max-w-4xl mx-auto m-5">
        <BlockNoteView
            editor={editor}
            slashMenu={false}
        >
          <SuggestionMenuController
              triggerCharacter={'/'}
              getItems={async (query) =>
                  filterSuggestionItems(getCustomSlashMenuItems(editor), query)
              }
          />
        </BlockNoteView>
        <div className="flex justify-end">
            <Button
                className="mt-4 mr-4 px-4 py-2"
                onClick={() => handleSubmitNote()}
            >
                Submit
            </Button>
        </div>
      </div>
    </div>
  );
}
