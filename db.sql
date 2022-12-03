------ ROLES ------

-- apiUser role is used by api to read/write manipulation of the database
create role "apiUser" with NOSUPERUSER NOCREATEDB NOCREATEROLE inherit LOGIN NOREPLICATION NOBYPASSRLS;

-- dataReader role is used by any applications that need read access to the database
create role "dataReader" with NOSUPERUSER NOCREATEDB NOCREATEROLE inherit LOGIN NOREPLICATION NOBYPASSRLS;

-- kube is the admin
create role "kube" with SUPERUSER CREATEDB CREATEROLE CONNECTION limit 1 INHERIT LOGIN REPLICATION BYPASSRLS;;

------ Tables ------

--- public.writer definition: List of writers
create table public.writer (
  writer_id             serial  not null,
  writer_name_first     text    not null,
  writer_name_last      text    not null,
  writer_name_nickname  text    null,
  writer_image_path     text    null,
  
  constraint writer_pkey primary key (writer_id),
  constraint writer_uq unique (writer_name_first, writer_name_last)
);

-- Permissions
alter table
  public.writer owner to kube;
grant all 
  on table public.writer to kube;
grant insert, select, update
  on table public.writer to "apiUser";
grant select
  on table public.writer to "dataReader";
 
-- Data
insert into public.writer (writer_name_first, writer_name_last, writer_name_nickname) values ('Joshua', 'Runyan', 'Jay');

--- public.tag definition: List of tags
create table public.tag (
  tag_id serial not null,
  tag text not null,
  
  constraint tag_pkey primary key (tag_id),
  constraint tag_uq unique (tag)
);

-- Permissions
alter table
  public.writer owner to kube;
grant all 
  on table public.tag to kube;
grant insert, select, update
  on table public.tag to "apiUser";
grant select
  on table public.tag to "dataReader";
 
-- Data
insert into public.tag (tag) values ('Meta'), ('AI'), ('Immortality');

--- public.article definition: List of articles
create table public.article (
  article_id uuid not null,
  article_title           text         not null,
  article_date_publish    timestamptz  not null default now(),
  article_date_last_edit  timestamptz  not null default now(),
  article_writer          int4         not null,
  article_tags            text[]       null,
  
  constraint article_pkey primary key (article_id),
  constraint article_writer_fkey foreign key (article_writer) references public.writer (writer_id)
);

-- Permissions
alter table
  public.article owner to kube;
grant all 
  on table public.article to kube;
grant insert, select, update
  on table public.article to "apiUser";
grant select
  on table public.article to "dataReader";
  
-- Triggers
create function article_last_edit_update()
returns trigger AS $$
  begin
    new.article_date_last_edit = now();
    return new;
  end;
$$ LANGUAGE plpgsql;

create trigger article_last_edit
  before update on public.article
  for each row
  execute procedure article_last_edit_update();
 
 --- public.article_tag definition: 1:Many relationship mapping between article and associated tags
create table public.article_tag (
  article_id  uuid  not null,
  tag_id      int4  not null,
  
  constraint article_tag_pkey primary key (article_id, tag_id),
  constraint article_tag_article_fkey foreign key (article_id) references public.article (article_id),
  constraint article_tag_tag_fkey foreign key (tag_id) references public.tag (tag_id)
);

-- Permissions
alter table
  public.writer owner to kube;
grant all 
  on table public.article_tag to kube;
grant insert, select, update
  on table public.article_tag to "apiUser";
grant select
  on table public.article_tag to "dataReader";
 
 
 
 
 
 
 
 