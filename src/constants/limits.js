// Espelhados em firestore.rules: alterar aqui exige alterar lá.
export const LIMITS = {
  boardName: 80,
  boardDescription: 300,
  groupName: 60,
  taskTitle: 200,
  taskDescription: 5000,
  taskNote: 1000,
  subtasks: 50,
  subtaskTitle: 200,
  boardMembers: 50,
  displayName: 120,
};

export const COMPLETED_PAGE_SIZE = 50;
export const WRITE_BATCH_SIZE = 400;
