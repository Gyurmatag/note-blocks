"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, getDefaultReactSlashMenuItems, ReactSlashMenuItem, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { ImMagicWand } from "react-icons/im";
import { useCompletion } from "ai/react";
import { Editor } from '@tiptap/core';
import { createNote } from "@/app/actions";
import { Button } from "@/components/ui/button";

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

  const getPrevText = (
    editor: Editor,
    {
      chars,
      offset = 0,
    }: {
      chars: number;
      offset?: number;
    }
  ) => {
    return editor.state.doc.textBetween(
      Math.max(0, editor.state.selection.from - chars),
      editor.state.selection.from - offset,
      '\n'
    );
  };

  const insertMagicAi = (editor: BlockNoteEditor) => {
    complete(
      getPrevText(editor._tiptapEditor, {
        chars: 5000,
        offset: 1,
      })
    );
  };

  const insertMagicItem: ReactSlashMenuItem = {
    name: 'Continue with AI',
    execute: insertMagicAi,
    aliases: ['ai', 'magic'],
    group: 'Magic',
    icon: <ImMagicWand size={18} />,
    hint: 'Continue your idea with some extra inspiration!',
  };

  const customSlashMenuItemList = [
    insertMagicItem,
    ...getDefaultReactSlashMenuItems(),
  ];

  const editor: BlockNoteEditor | null = useBlockNote({
    slashMenuItems: customSlashMenuItemList,
  });

  const handleSubmitNote = async () => {
    const note = {
      document: editor.topLevelBlocks
    }
    await createNote(note)
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 w-full">
      <div className="relative w-full max-w-4xl mx-auto mb-4">
        <Button
          className="absolute right-0 top-0 mt-4 mr-4 px-4 py-2"
          onClick={() => handleSubmitNote()}
        >
          Submit
        </Button>
        <BlockNoteView
          className="w-full bg-white p-4 pt-16"
          editor={editor}
          theme={"light"}
        />
      </div>
    </div>
  );
}
