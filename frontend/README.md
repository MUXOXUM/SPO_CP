# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


Вот переписанный текст из изображения в виде таблицы:

| album_id (PK) | title               | release_year | duration | label                | artist_id | genre_id |
|---------------|---------------------|--------------|----------|----------------------|-----------|----------|
| 1             | Живой Рок           | 2020         | 45       | Музыкальный лейбл №1 | 1         | 1        |
| 2             | Мелодии Попа        | 2019         | 50       | Тор Hits             | 2         | 2        |
| 3             | Джазовый Вечер      | 2018         | 60       | Jazz Records         | 3         | 3        |
| 4             | Классические Хиты   | 2017         | 70       | Classic Sound        | 4         | 4        |
| 5             | Улицы Хип-хопа      | 2021         | 40       | Urban Beats          | 5         | 5        |
| 6             | Звуки Кантри        | 2016         | 55       | Country Music Ltd.   | 6         | 6        |
| 7             | Электронный Мир     | 2022         | 48       | Electro Records      | 7         | 7        |

**Примечания:**
- `album_id` является первичным ключом (PK) типа integer
- `title` и `label` имеют тип character varying (255) (строка до 255 символов)
- Остальные поля (`release_year`, `duration`, `artist_id`, `genre_id`) имеют тип integer