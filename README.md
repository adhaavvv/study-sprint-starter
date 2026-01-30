# C219 Week 10 Card App (Student Starter Repo)

This is a starter codebase: Frontend–Backend Integration with React Router + CRUD.

You will complete the TODOs to build a Card Management App that talks to your deployed Express API.

---

## Routes (Required)

- `/` Home
- `/cards` View all cards
- `/cards/new` Add a new card
- `/cards/:id/edit` Edit a card

## Backend API Contract (Required)

- `GET    /allcards`
- `POST   /addcard`
- `PUT    /updatecard/:id`
- `DELETE /deletecard/:id`

Expected card JSON shape:

```json
{ "id": 1, "card_name": "Pikachu", "card_pic": "https://..." }
```
