// =================================================================================================
// Typings =========================================================================================
enum ProjectStatus {
    Active,
    Finished
}

type Listener<T> = (items: T[]) => void

class Project {
    id: string
    title: string
    description: string
    people: number
    status: ProjectStatus
    
    constructor(
        id: string,
        title: string,
        description: string,
        people: number,
        status: ProjectStatus
    ) {
        this.id = id
        this.title = title
        this.description = description
        this.people = people
        this.status = status
    }
}

// Drag & Drop Interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void
    dragEndHandler(event: DragEvent): void
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void
    dragLeaveHandler(event: DragEvent): void
    dropHandler(event: DragEvent): void
}


// =================================================================================================
// Project State Management ========================================================================
abstract class State<T> {
    protected listeners: Listener<T>[] = []

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

class ProjectState extends State<Project> {
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

        if (project) {
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

const projectState = ProjectState.getInstance()


// =================================================================================================
// Validation ======================================================================================
interface Validatable {
    name: string,
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    minValue?: number
    maxValue?: number
}

type ValidationOutput = {
    isValid: boolean,
    message?: string
}

function validate(input: Validatable): ValidationOutput {

    if (input.required) {
        if (input.value.toString().trim().length === 0) {
            return {
                isValid: false,
                message: `${input.name} is required but does not have a value.`
            }
        }
    }

    if (input.minLength != null && typeof input.value === 'string') {
        if (input.value.length < input.minLength) {
            return {
                isValid: false,
                message: `${input.name}'s length is less than its minimum length of ${input.minLength}.`
            }
        }
    }

    if (input.maxLength != null && typeof input.value === 'string') {
        if (input.value.length > input.maxLength) {
            return {
                isValid: false,
                message: `${input.name}'s length is more than its maximum length of ${input.maxLength}.`
            }
        }
    }

    if (input.minValue != null && typeof input.value === 'number') {
        if (input.value < input.minValue) {
            return {
                isValid: false,
                message: `${input.name}'s value is less than its minimum value of ${input.minValue}.`
            }
        }
    }

    if (input.maxValue != null && typeof input.value === 'number') {
        if (input.value > input.maxValue) {
            return {
                isValid: false,
                message: `${input.name}'s value is more than its maximum value of ${input.maxValue}.`
            }
        }
    }

    return { isValid: true }
}

// autobind decorator
function AutobindThis(_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }

    return adjDescriptor
}

// =================================================================================================
// Component Base Class ============================================================================
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U

    constructor(templateId: string, 
            hostElementId: string,
            insertAtStart: boolean,
            newElementId?: string, 
    ) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement
        this.hostElement = document.getElementById(hostElementId)! as T

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as U

        if (newElementId) {
            this.element.id = newElementId
        }

        this.attach(insertAtStart)
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtStart ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure(): void
    abstract renderContent(): void
}


// =================================================================================================
// ProjectItem Class ===============================================================================
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {

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

// =================================================================================================
// Project List ====================================================================================
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

// =================================================================================================
// Project Input ===================================================================================
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        super('project-input', 'app', true, 'user-input')

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

        this.configure()
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() {}

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value
        
        const isValid = this.validateUserInput(enteredTitle, enteredDescription, +enteredPeople)

        if (isValid) {
            return [enteredTitle.trim(), enteredDescription.trim(), +enteredPeople]
        }
    }

    private validateUserInput(title: string, description: string, people: number): boolean {
        const titleValidatable: Validatable = {
            name: 'Title',
            value: title,
            required: true,
            minLength: 3
        }

        const descriptionValidatable: Validatable = {
            name: 'Description',
            value: description,
            required: true,
            minLength: 5
        }

        const peopleValidatable: Validatable = {
            name: 'People',
            value: people,
            required: true,
            minValue: 1,
            maxValue: 5
        }

        const titleValidity = validate(titleValidatable)
        if (!titleValidity.isValid) {
            alert(titleValidity.message)
            return false
        }

        const descriptionValidity = validate(descriptionValidatable)
        if (!descriptionValidity.isValid) {
            alert(descriptionValidity.message)
            return false
        }

        const peopleValidity = validate(peopleValidatable)
        if (!peopleValidity.isValid) {
            alert(peopleValidity.message)
            return false
        }

        return true
    }

    private resetForm() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }

    @AutobindThis
    private submitHandler(event: Event) {
        event.preventDefault()

        const userInput = this.gatherUserInput()

        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput
            console.log(title, description, people)
            projectState.addProject(title, description, people)
            this.resetForm()
        }
    }
}

const projInput = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
