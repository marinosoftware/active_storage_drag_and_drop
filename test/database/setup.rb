# frozen_string_literal: true

Dummy::Application.load_tasks
Rails.application.routes.disable_clear_and_finalize = true

ActiveRecord::Base.establish_connection(adapter: 'sqlite3', database: 'db/test.sqlite3')
Rake::Task['active_storage:install'].invoke

migration = Dir.glob('test/dummy/db/migrate/*_create_active_storage_tables.active_storage.rb')
               .first
load File.open(migration)

require_relative 'create_users_migration'

CreateActiveStorageTables.migrate(:up)
CreateUsers.migrate(:up)

MiniTest.after_run do
  File.delete(Rails.root.join('db', 'test.sqlite3'))
end
