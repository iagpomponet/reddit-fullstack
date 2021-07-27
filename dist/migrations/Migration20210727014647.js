"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20210727014647 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20210727014647 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "post" ("id" serial primary key, "created_at" jsonb not null, "updated_at" jsonb not null, "title" varchar(255) not null);');
    }
}
exports.Migration20210727014647 = Migration20210727014647;
//# sourceMappingURL=Migration20210727014647.js.map