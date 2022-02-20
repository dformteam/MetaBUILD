class Semaphore {
    max;
    counter = 0;
    waiting = [];
    constructor({ max = 50 }) {
        this.max = max;
    }

    take = () => {
        try {
            if (this.waiting.length > 0 && this.counter < this.max) {
                this.counter++;
                const promise = this.waiting.shift();
                promise.resolve();
            }
        } catch {}
    };

    acquire = () => {
        try {
            if (this.counter < this.max) {
                this.counter++;
                return new Promise((resolve) => resolve());
            } else {
                return new Promise((resolve, err) => {
                    this.waiting.push({ resolve, err });
                });
            }
        } catch (err) {}
    };

    release = () => {
        this.counter--;
        this.take();
    };

    purge = () => {
        const unresolved = this.waiting?.length;

        this.waiting.map((task) => {
            task.err('Task has been purged');
        });

        this.counter = 0;
        this.waiting = [];

        return unresolved;
    };
}

export default Semaphore;
