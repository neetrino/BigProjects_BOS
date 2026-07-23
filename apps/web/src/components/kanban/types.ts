export type BoardViewMode = 'kanban' | 'list';

export type KanbanColumnTone = 'default' | 'positive' | 'negative';

export type KanbanColumnDef<TStage extends string = string> = {
  id: TStage;
  title: string;
  tone?: KanbanColumnTone;
};
