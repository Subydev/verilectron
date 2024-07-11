# Verisurf API Example App
This Electron application demonstrates how to use the Verisurf API to interact with Verisurf Software. It provides a user-friendly interface to explore and test various API commands available in the Verisurf SDK.
## Features
- Connect to Verisurf Software using TCP communication
- Responsive and intuitive user interface built with modern web technologies
- Send commands to Verisurf and view the XML response in a formatted output panel
- View detailed documentation for each API command using the built-in Markdown viewer
- Browse and select from a wide range of API commands categorized by functionality
- Open an external DRO (Digital Readout) window to run measurement commands

## Installation

To run the Verisurf API Example App, follow these steps:

1. Ensure you have [Node.js](https://nodejs.org/) installed on your system.

2. Clone this repository or download the source code.

3. Open a Terminal window and navigate to the project directory.

4. Install the required dependencies by running the following command:
    ```
   npm install
    ```
   
5. Start the application with the following command:
   ```
   npm start
   ```

6. The application window will open automatically. If it doesn't, you can access it at `http://localhost:3000`.

## Stack
- [Electron](https://www.electronjs.org/) - A framework for building cross-platform desktop applications with web technologies.

- [Node.js](https://nodejs.org/) - A JavaScript runtime for server-side development.

- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) - The standard markup language for creating web pages.

- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - A stylesheet language used for describing the look and formatting of a document written in HTML.

- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - A high-level programming language used for client-side and server-side scripting.

- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom user interfaces.

- [Alpine.js](https://alpinejs.dev/) - A lightweight JavaScript framework for adding interactivity to web pages.

- [Showdown](https://showdownjs.com/) - A JavaScript library for converting Markdown to HTML.

- [Intro.js](https://introjs.com/) - A library for creating step-by-step tutorials and onboarding guides.


## Usage

1. Launch Verisurf Software and ensure the TCP port is enabled in the SDK Preferences.

2. Open the Verisurf API Example App.

3. Click on the "Connect" button to establish a connection with Verisurf.

4. Explore the available API commands by selecting a category from the sidebar.

5. Click on a command to view its documentation in the Markdown viewer.

6. Fill in any required parameters or IDs for the selected command.

7. Click the "Send Command" button to send the command to Verisurf.

8. View the XML response from Verisurf in the output panel.

9. Use the "Open DRO" button to open an external window for running measurement commands.

10. Refer to the built-in tutorial by clicking on the "Tutorial" button in the sidebar for a guided walkthrough of the app's features.

## Building and Packaging
To build and package the application for distribution, follow these steps:

1. Update the version number in package.json to reflect the new release version.

2. Run the following command to create the build:
    ```
    npm run make
    ```
3. This will generate the necessary build files in the out directory, including:

- `RELEASES`
- `Verisurf.API.Example-<version>-Setup.exe`
- `verisurfapisample-<version>-full.nupkg`
4. Optionally, you can also include sourcecode.zip and .tar.gz files in the release for convenience and compliance with open-source licenses.

5. Upload these files to a new release on your GitHub repository.

## Contributing

Contributions to the Verisurf API Example App are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/yourusername/verisurf-api-example).

## License

This project is licensed under the [MIT License](LICENSE).


## Contact

For any questions or inquiries, please contact [sdk@verisurf.com](mailto:sdk@verisurf.com).

