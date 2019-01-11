Dummy::Application.load_tasks
Rake::Task['active_storage:install'].invoke

migration = Dir.glob('test/dummy/db/migrate/*_create_active_storage_tables.active_storage.rb')
               .first
load File.open(migration)

require_relative 'create_users_migration'

ActiveRecord::Base.establish_connection(adapter: 'sqlite3', database: ':memory:')
CreateActiveStorageTables.migrate(:up)
CreateUsers.migrate(:up)
