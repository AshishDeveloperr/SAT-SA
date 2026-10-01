.PHONY: all install start dev test docker-up docker-down

all: install dev

install:
	cd backend && npm install
	cd frontend && npm install

start:
	cd backend && npm start

dev:
	start cmd /k "cd backend && npm run dev"
	start cmd /k "cd frontend && npm run dev"

build:
	cd frontend && npm run build

test:
	node -e "console.log('Testing SAT-SA endpoints...');"
	cd backend && node -e "import('./src/core/db/knex.js').then(async ({ db }) => { const c = await db('entities').count('id as count').first(); console.log('Entities in DB:', c.count); process.exit(0); })"

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down
