import {
  text,
  pgTable,
  uuid,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  // basic file/folder information
  name: text("name").notNull(),
  path: text("path").notNull(), //  /document/project/resume
  size: integer("size").notNull(),
  type: text("type").notNull(), // "folder"

  //   stroge information
  fileUrl: text("file_url"), // url to access the file
  thumbnailUrl: text("thumbnail_url"),

  //   ownership
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"), // parent folder id if (null for root items)

  //   file/folder flags
  ifFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  ifTrash: boolean("is_trash").default(false).notNull(),

  //   timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*
parent: each file/folder can have one parent folder

children: each folder can have many child files/folders
*/
export const filesRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),

  // relationship to child file/folder
  children: many(files),
}));

// type defination
export const File = files.$inferSelect;
export const NewFile = files.$inferInsert;
