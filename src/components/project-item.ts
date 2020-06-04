import { Project } from '../models/project.js'
import { Component } from './base.js'
import { Draggable } from '../models/drag-drop.js'
import { AutobindThis } from '../decorators/autobind.js'

// =================================================================================================
// ProjectItem Class ===============================================================================
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {

    private project: Project

    get title() {
        return this.project.title
    }

    get description() {
        return this.project.description
    }

    get persons() {
        if (this.project.people === 1) {
            return '1 person'
        }

        return `${this.project.people} persons`
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id)
        this.project = project

        this.configure()
        this.renderContent()
    }

    @AutobindThis
    dragStartHandler(event: DragEvent) {
        console.log('Drag Start!')
        event.dataTransfer!.setData('text/plain', this.project.id)
        event.dataTransfer!.effectAllowed = 'move'
    }

    @AutobindThis
    dragEndHandler(_: DragEvent) {
        console.log('Drag End!')
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.title
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned'
        this.element.querySelector('p')!.textContent = this.description
    }
}
