'use server'

import prisma from "@/prisma/client";

type Note = {
  document: object
}

export async function createNote(note: Note) {
  return prisma.note.create({
    data: note,
  });
}
