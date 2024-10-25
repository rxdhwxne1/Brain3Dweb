"use strict";
import ThreeMeshUI from "three-mesh-ui";
import {Color, Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader} from "three";
import FontJSON from "./assets/NotoSans-Italic-VariableFont_wdth,wght.json" with {type: "json"};
import FontImage from "./assets/NotoSans-Italic-VariableFont_wdth,wght.png";


export let button = []

export class Interface {
    constructor(position, scene, getTranslations, brain_loader) {
        this.position = position;
        this.scene = scene;
        this.brain_loader = brain_loader; // only for intro interface
        this.selectedLanguage = 'fr';
        this.dropdownVisible = false;
        this.translations = getTranslations;
        this.container = new ThreeMeshUI.Block({
            ref: "container",
            padding: 0.025,
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontColor: new Color(0xffffff),
            backgroundOpacity: 0,
        });
        this.createIntroPlane();
    }

    createIntroPlane() {
        this.container.position.set(this.position.x, this.position.y, this.position.z);
        this.container.rotation.x = this.position.rotation ? this.position.rotation.x : -0.55;
        this.container.rotation.y = this.position.rotation ? this.position.rotation.y : 0;
        this.container.rotation.z = this.position.rotation ? this.position.rotation.z : 0;
        this.scene.add(this.container);

        const title = new ThreeMeshUI.Block({
            height: 0.2,
            width: 1.5,
            margin: 0.01,
            justifyContent: "center",
            fontSize: 0.09,
        });

        this.container.add(title);

        const contentContainer = new ThreeMeshUI.Block({
            height: 0.5,
            width: 0.7,
            margin: 0.01,
            justifyContent: "center",
            alignContent: "center",
            backgroundOpacity: 0.5,
            flexDirection: "column",
        });

        const content = new ThreeMeshUI.Text({
            content: this.translations[this.selectedLanguage].content,
            fontSize: 0.05,
        });
        let buttonContainer = null, buttonText = new ThreeMeshUI.Text({
            content: this.translations[this.selectedLanguage].button,
            fontSize: 0.05,
        });
        if (this.brain_loader !== undefined) {

            buttonContainer = new ThreeMeshUI.Block({
                width: 0.4,
                height: 0.15,
                justifyContent: 'center',
                margin: 0.01,
                borderRadius: 0.075,
                backgroundOpacity: 0.8,
                backgroundColor: new Color(0xCACACA),
            });


            const selectedAttributes = {
                offset: 0.02,
                backgroundColor: new Color(0x777777),
                fontColor: new Color(0x222222)
            };

            const hoveredStateAttributes = {
                state: 'hovered',
                attributes: {
                    offset: 0.035,
                    backgroundColor: new Color(0x999999),
                    backgroundOpacity: 1,
                    fontColor: new Color(0xffffff)
                },
            };

            const idleStateAttributes = {
                state: 'idle',
                attributes: {
                    offset: 0.035,
                    backgroundColor: new Color(0xCACACA),
                    backgroundOpacity: 0.3,
                    fontColor: new Color(0xffffff)
                },
            };

            buttonContainer.setupState({
                state: "selected",
                attributes: selectedAttributes,
                onSet: (self) => {
                    console.log("Button selected");
                    this.scene.remove(this.container);
                    this.brain_loader();
                    button = [];
                }
            });
            buttonContainer.setupState(hoveredStateAttributes);
            buttonContainer.setupState(idleStateAttributes);

            buttonContainer.add(buttonText);
        }

        contentContainer.add(content);
        if (buttonContainer !== null) {
            contentContainer.add(new ThreeMeshUI.Block({height: 0.7}));
            contentContainer.add(buttonContainer);
        }
        const top = new ThreeMeshUI.Block({
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11
        });
        const ttsButton = this.createTTSButton()
        top.add(ttsButton);
        this.createLanguageDropdown(top, title, content, buttonText);
        this.container.add(contentContainer);

        title.add(
            new ThreeMeshUI.Text({
                content: this.translations[this.selectedLanguage].intro,
            })
        );
        if (buttonContainer !== null) {
            button.push(buttonContainer);
        }

        ThreeMeshUI.update();
    }

    createTTSButton() {
        const ttsButton = new ThreeMeshUI.Block({
            width: 0.12,
            height: 0.12,
            justifyContent: 'center',
            margin: 0.05,
            borderRadius: 0.05,
            backgroundOpacity: 0.8,
            backgroundColor: new Color(0xffffff),
        });

        const ttsButtonText = new ThreeMeshUI.Text({
            content: '', // You can leave this empty or put some text if needed
            fontSize: 0.06,
            fontColor: new Color(0xFFFFFF), // White color for contrast
        });

        const loader = new TextureLoader();
        loader.load(
            './assets/sound_icon.png',
            (texture) => {
                // Create a mesh for the emoji
                const emojiMaterial = new MeshBasicMaterial({map: texture});
                const emojiGeometry = new PlaneGeometry(0.1, 0.1); // Adjust the size as needed
                const emojiMesh = new Mesh(emojiGeometry, emojiMaterial);

                // Position the emoji on the button
                emojiMesh.position.set(0, 0, 0.01); // Slightly in front to ensure visibility
                ttsButton.add(emojiMesh);
                console.log("TTS button created with texture");
            },
            undefined,
            (err) => {
                console.error("An error occurred loading the texture:", err);
            }
        );


        ttsButton.add(ttsButtonText);

        ttsButton.setupState({
            state: 'selected',
            onSet: () => {
                this.activateTTS();
            }
        });

        ttsButton.setupState({
            state: 'hovered',
            attributes: {
                offset: 0.02,
                backgroundColor: new Color(0xDD0000), // Slightly darker red on hover
                fontColor: new Color(0xDD0000),
            }
        });

        ttsButton.setupState({
            state: 'idle',
            attributes: {
                offset: 0.02,
                backgroundColor: new Color(0x666666),
                fontColor: new Color(0xffffff)
            }
        });


        button.push(ttsButton);
        return ttsButton;
    }

    activateTTS() {
        if (!window.speechSynthesis) {
            console.error("Speech synthesis not supported by your browser.");
            return;
        }
        const textToSpeak = this.translations[this.selectedLanguage].content;
        const speech = new SpeechSynthesisUtterance(textToSpeak);
        speech.lang = this.selectedLanguage === 'fr' ? 'fr-FR' : this.selectedLanguage === 'en' ? 'en-US' : 'es-ES';
        window.speechSynthesis.speak(speech);
        console.log("TTS activated for language:", this.selectedLanguage);
    }

    createLanguageDropdown(top, titleText, contentText, buttonText) {
        const dropdownButton = new ThreeMeshUI.Block({
            width: 0.4,
            height: 0.15,
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            margin: 0.05,
            borderRadius: 0.05,
            backgroundOpacity: 0.8,
            backgroundColor: new Color(0x444444),
        });

        const dropdownButtonText = new ThreeMeshUI.Text({
            content: this.selectedLanguage.toUpperCase(),
            fontSize: 0.05,
        });

        dropdownButton.add(dropdownButtonText);
        top.add(dropdownButton);
        this.container.add(top);

        const dropdownContainer = new ThreeMeshUI.Block({
            height: 0,
            width: 0.4,
            justifyContent: 'center',
            flexDirection: 'column',
            contentDirection: 'row-reverse',
            backgroundOpacity: 0,
        });

        this.container.add(dropdownContainer);

        const populateDropdown = () => {
            dropdownContainer.clear();

            let languages = ['fr', 'en', 'es'];
            languages = languages.filter((lang) => lang !== this.selectedLanguage);
            languages.forEach((lang) => {
                const langOption = new ThreeMeshUI.Block({
                    width: 0.4,
                    height: 0.1,
                    justifyContent: 'center',
                    margin: 0.05,
                    borderRadius: 0.05,
                    backgroundOpacity: 0.8,
                    backgroundColor: new Color(0x666666),
                });

                const langText = new ThreeMeshUI.Text({
                    content: lang.toUpperCase(),
                    fontSize: 0.05,
                });

                langOption.add(langText);
                langOption.setupState({
                    state: 'selected',
                    onSet: () => {
                        this.selectedLanguage = lang;
                        this.updateTextContent(titleText, contentText, buttonText);
                        dropdownButtonText.set({content: this.selectedLanguage.toUpperCase()});
                        this.dropdownVisible = false;
                        this.destroyDropdown(this.container, dropdownContainer);
                        console.log("Selected language:", this.selectedLanguage);
                    }
                });
                langOption.setupState({
                    state: 'hovered',
                    attributes: {
                        offset: 0.02,
                        backgroundColor: new Color(0x777777),
                        fontColor: new Color(0x222222)
                    }
                });
                langOption.setupState({
                    state: 'idle',
                    attributes: {
                        offset: 0.02,
                        backgroundColor: new Color(0x666666),
                        fontColor: new Color(0xffffff)
                    }
                });
                button.push(langOption);

                dropdownContainer.add(langOption);
            });
        };

        dropdownButton.setupState({
            state: 'selected',
            onSet: () => {
                if (!this.dropdownVisible) {
                    this.toggleDropdown(dropdownContainer);
                    populateDropdown();
                }
            }
        });
        dropdownButton.setupState({
            state: 'hovered',
            attributes: {
                offset: 0.035,
                backgroundColor: new Color(0x999999),
                backgroundOpacity: 1,
                fontColor: new Color(0xffffff)
            }
        });
        dropdownButton.setupState({
            state: 'idle',
            attributes: {
                offset: 0.035,
                backgroundColor: new Color(0xCACACA),
                backgroundOpacity: 0.3,
                fontColor: new Color(0xffffff)
            }
        });

        button.push(dropdownButton);
    }

    toggleDropdown(dropdownContainer) {
        this.dropdownVisible = !this.dropdownVisible;
        dropdownContainer.set({
            height: this.dropdownVisible ? 0.5 : 0,
            backgroundOpacity: this.dropdownVisible ? 0.5 : 0
        });
    }

    destroyDropdown(container, dropdownContainer) {
        while (dropdownContainer.children.length > 0) {
            try {
                const child = dropdownContainer.children[0];
                dropdownContainer.remove(child);

                child.clear();
                button = button.filter((item) => item !== child);
            } catch (e) {
                console.log(e);
            }
        }

        dropdownContainer.set({height: 0, backgroundOpacity: 0});
    }

    updateTextContent(titleText, contentText, buttonText) {
        titleText.set({content: this.translations[this.selectedLanguage].intro});
        contentText.set({content: this.translations[this.selectedLanguage].content});
        if (this.brain_loader)
            buttonText.set({content: this.translations[this.selectedLanguage].button});
    }
}