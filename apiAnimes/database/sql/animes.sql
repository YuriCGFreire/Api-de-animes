create table if not exists animes (
    id int unsigned not null auto_increment,
    nome varchar(100) not null, 
    autor varchar(100) not null, 
    estudio varchar(100) not null,
    primary key(id)
);