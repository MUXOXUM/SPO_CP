# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


Вот переписанный текст из изображения в виде таблицы:

| product_id (PK) | format    | price    | stock_quantity | barcode        | condition | album_id |
|-----------------|-----------|----------|----------------|----------------|-----------|----------|
| 1               | CD        | 499.99   | 15             | 1234567890123  | Новый    | 1        |
| 2               | Bwhun     | 1299.50  | 10             | 2345678901234  | Новый   | 2        |
| 3               | Цифровой  | 299.99   | 100            | 3456789012345  | Новый   | 3        |

**Примечания:**
- `product_id` — первичный ключ (PK) типа `integer`
- `format`, `barcode`, `condition` — строки (`character varying (255)`)
- `price` — числовой тип с точностью до 2 знаков (`numeric(10,2)`)
- `stock_quantity` и `album_id` — целые числа (`integer`)