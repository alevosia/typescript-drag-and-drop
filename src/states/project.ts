import { Project, ProjectStatus } from '../models/project'

// =================================================================================================
// Project State Management ========================================================================
export type Listener<T> = (items: T[]) => void

export abstract class State<T> {
    protected listeners: Listener<T>[] = []

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

export class ProjectState extends State<Project> {
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor() {
        super()
    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }

        this.instance = new ProjectState()
        return this.instance
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.Active
        )

        this.projects.push(newProject)
        this.invokeStateChangeListeners()
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find((project) => project.id === projectId)

        if (project && project.status !== newStatus) {
            project.status = newStatus
            this.invokeStateChangeListeners()
        }
    }

    // call all attached listener functions
    private invokeStateChangeListeners() {
        for (const listener of this.listeners) {
            listener(this.projects.slice())
        }
    }
}

export const projectState = ProjectState.getInstance()
