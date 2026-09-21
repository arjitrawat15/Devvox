## Backend (Python/FastAPI)

- Use `python` / `pip` for package management
- Dependencies: `requirements.txt` (project root)
- Virtual environment: `apps/backend/venv/`
- Run server: `cd apps/backend && source venv/Scripts/activate && uvicorn app.main:app --reload --port 3001`
- Database migrations: `alembic upgrade head`
- New migration: `alembic revision --autogenerate -m "description"`
- Environment variables in `.env` (see `.env.example`)
