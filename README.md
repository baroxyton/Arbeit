# SPASocial: A simple social media site

DISCLAIMED: Unmaintained hobbyist project. Do not deploy.


## Installation

### 1. Building the frontend

```bash
git clone git@github.com:baroxyton/Arbeit.git &&
cd Arbeit &&
cd frontend &&
npm i &&
npm run build 
```

### 2. Installing the backend

```bash
cd ../backend &&
npm i
```

in order to add support for images, register a imgbb api key and add it to `backend/.imgbb-key`

When running without image support, it is still necessary to create an empty file `backend/.imgbb-key`

### 3. Running

To run on port 8080:

```bash
node index.js
```

### 4. Adding admin user

An existing user can be made admin manually in the database as follows:

1. halt server
2. edit `backend/.data.json`
3. add the `"admin"` role after the `"user"` role and save
4. restart the server. The user should now be admin. 

Admins can use the interface available at `/admin` for moderating and creating new users.
