# dSuite

Wellcome to our dSuite project.

This project contant two main parts:

- Contract
- UI

Contract: Contant the logic code of dSuite
UI: User interface wite dSuite

## How to run

1. Prerequisites

   - Nodejs
   - npm
   - Near Cli

2. Clone this project

    ```bash
    git clone https://github.com/dformteam/MetaBUILD.git
    ```

    1. Contract

       install node module

       ```bash
       npm install
       ```

       Move to the contract folder, update your contract owner

       ```bash
       cd metabuid/contract
       ```

       Open the config file in src folder in your editor

       ```bash
       vi src/config.js
       ```

       Type your contract owner as your own

       ```javascript
       const CONTRACT_NAME = "neutrino.testnet"; <- Replace this line by your contract name
       ```

       Next one, let compile the contract and deploy it into the testnet

       ```bash
       npx asb
       near deploy
       ```

    1. UI

       install node module

       ```bash
       npm install
       ```

       Update your contract name by opening the config file in backed folder

       ```bash
       cd metabuild/ui
       vi backed/config
       ```

       Then update this line

       ```javascript
       const CONTRACT_NAME = 'neutrino.testnet'; <- Change this line
       ```

       Build and run the project

       ```bash
       npm run build
       npm run start
       ```
