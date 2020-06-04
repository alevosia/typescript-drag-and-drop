import { Project, ProjectStatus } from '../models/project.js'
import { projectState } from '../states/project.js'
import { Component } from './base.js'
import { DragTarget } from '../models/drag-drop.js'
import { AutobindThis } from '../decorators/autobind.js'
import { ProjectItem } from './project-item.js'

// =================================================================================================
// Project List ====================================================================================
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[] = []

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`)

        this.configure()
        this.renderContent()
    }

    @AutobindThis
    dragOverHandler(event: DragEvent) {
        // console.log('Drag Over: ' + this.type)
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault()
            const listEl = this.element.querySelector('ul')!
            listEl.classList.add('droppable')
        }
    }

    @AutobindThis
    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer!.getData('text/plain') 
        const newStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished

        projectState.moveProject(projectId, newStatus)
    }

    @AutobindThis
    dragLeaveHandler(_: DragEvent) {
        const listEl = this.element.querySelector('ul')!
        listEl.classList.remove('droppable')
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
        this.element.addEventListener('drop', this.dropHandler)

        // update assigned projects of this list whenever the state changes
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((project) => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active
                } else {
                    return project.status === ProjectStatus.Finished
                }
            })

            this.assignedProjects = relevantProjects
            this.renderProjects()
        })
    }

    renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        listEl.innerHTML = ''

        for (const project of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, project)
        }
    }
}
