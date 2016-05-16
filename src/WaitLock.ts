/**
 * Delays execution of callbacks until a number of actions are completed.
 */
export class WaitLock {
    /**
     * A queue of callbacks to be executed when ready.
     */
    private callbacks: Function[] = [];

    /**
     * How many actions have yet to complete.
     */
    private pendingActions: number = 0;

    /**
     * Whether this was already triggered.
     */
    private completed: boolean;

    /**
     * Adds a callback to be executed.
     * 
     * @param callback   A callback to be executed.
     */
    public addCallback(callback: Function): void {
        if (this.completed) {
            callback();
        } else {
            this.callbacks.push(callback);
        }
    }

    /**
     * Marks that an action has started.
     */
    public markActionStart(): void {
        this.pendingActions += 1;
    }

    /**
     * Marks that an action has completed. If all actions have
     * completed, the callbacks queue is drained.
     */
    public markActionCompletion(): void {
        this.pendingActions -= 1;

        if (this.pendingActions === 0) {
            this.onCompletion();
        }
    }

    /**
     * Drains the callbacks queue by calling them all.
     */
    private onCompletion(): void {
        this.completed = true;
        this.callbacks.forEach(recipient => recipient());
        this.callbacks = [];
    }
}
