"use strict";
import ThreeMeshUI from "three-mesh-ui";
import {Color} from "three";
import FontJSON from "./assets/NotoSans-Italic-VariableFont_wdth,wght.json";
import FontImage from "./assets/NotoSans-Italic-VariableFont_wdth,wght.png";

export let button = []


export class Interface {
    constructor(camera, scene, brain_loader, getTranslations) {
        this.camera = camera;
        this.scene = scene;
        this.brain_loader = brain_loader; // only for intro interface
        this.selectedLanguage = 'fr';
        this.dropdownVisible = false;
        this.translations = getTranslations;
        this.createIntroPlane();
    }

    createIntroPlane() {
        const container = new ThreeMeshUI.Block({
            ref: "container",
            padding: 0.025,
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontColor: new Color(0xffffff),
            backgroundOpacity: 0,
        });

        container.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z + 1.6);
        container.rotation.x = -0.55;
        this.scene.add(container);

        const title = new ThreeMeshUI.Block({
            height: 0.2,
            width: 1.5,
            margin: 0.01,
            justifyContent: "center",
            fontSize: 0.09,
        });

        title.add(
            new ThreeMeshUI.Text({
                content: this.translations[this.selectedLanguage].intro,
            })
        );
        container.add(title);

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
        let buttonContainer, buttonText;
        if (this.brain_loader) {

             buttonContainer = new ThreeMeshUI.Block({
                width: 0.4,
                height: 0.15,
                justifyContent: 'center',
                margin: 0.01,
                borderRadius: 0.075,
                backgroundOpacity: 0.8,
                backgroundColor: new Color(0xCACACA),
            });

             buttonText = new ThreeMeshUI.Text({
                content: this.translations[this.selectedLanguage].button,
                fontSize: 0.05,
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
                    this.scene.remove(container);
                    this.brain_loader();
                }
            });
            buttonContainer.setupState(hoveredStateAttributes);
            buttonContainer.setupState(idleStateAttributes);

            buttonContainer.add(buttonText);
        }

        contentContainer.add(content);
        if (this.brain_loader) {
            contentContainer.add(new ThreeMeshUI.Block({height: 0.7}));
            contentContainer.add(buttonContainer);
        }
        this.createLanguageDropdown(container, title, content, buttonText);
        container.add(contentContainer);
        button.push(buttonContainer);
    }

    createLanguageDropdown(container, titleText, contentText, buttonText) {
        const dropdownButton = new ThreeMeshUI.Block({
            width: 0.4,
            height: 0.15,
            justifyContent: 'center',
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
        container.add(dropdownButton);

        const dropdownContainer = new ThreeMeshUI.Block({
            height: 0,
            width: 0.4,
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundOpacity: 0,
        });

        container.add(dropdownContainer);

        const populateDropdown = () => {
            dropdownContainer.clear();

            let languages = ['fr', 'en'];
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
                        this.destroyDropdown(container, dropdownContainer);
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