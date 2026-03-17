# MyShare

MyShare is an open-source, universal clipboard service designed for seamless file, note, and media sharing across devices.

---

## Local Setup

To get MyShare running on your machine, follow these steps:

### 1. Prerequisites
- **Node.js**: (v16+ recommended)
- **MariaDB**: (v10+ recommended)

### 2. Database Setup
1. Open your MariaDB Command Line Client.
2. Run the contents of `setup_database.sql` to setup the database.
*Note: You can change the database name and credentials, but remember to update your `.env` accordingly.*

### 3. Install Dependencies
Open a terminal in the project root and run:
```bash
npm install
```

### 4. Environment Configuration
Copy the `.env.example` file to create your own `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your details:
- `DB_PASSWORD`: Set this to the password you chose during database setup.
- `BASE_URL`: Set this to `http://localhost:3010` or wherever you are hosting.

### 5. Start the Application
```bash
node src/index.js
```
The application will be accessible at [http://localhost:3010](http://localhost:3010).

---

## Troubleshooting

### CSS Not Refreshing
If you are having issues with the tailwindcss configuration, try running `npm run build-css` to rebuild it.



## TODO List
- [ ] Label/Tagging functionality
- [x] File uploading
- [x] Host-independent frontend
- [ ] Finalize UI/UX polish
- [ ] Advanced security hardening