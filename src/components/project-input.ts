namespace App {
    // =================================================================================================
    // Project Input ===================================================================================
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}