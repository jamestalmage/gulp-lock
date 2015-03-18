gulp-lock
=========

Control concurrency of gulp tasks.

Gulp always attempts to run tasks with "maximum concurrency".
While this is usually a good thing, there are occasions where contention
over constrained resources (disk, network, memory, etc) can cause problems.
You could use something like `gulp-sequence` to limit concurrency,
but that requires you to build a specific sequence for every scenario
and essentially fights against gulps task orchestrator.

`gulp-lock` helps you limit concurrency only where needed.
Consider the following diagram:

![Diagram](https://rawgit.com/jamestalmage/exclusive-task/master/resource-contention.png)

Properly orchestrating these tasks presents a few difficulties;
Which task will be ready to run first?
What if it varies (network congestion, etc)?
How do you compose them as dependencies to other tasks in a non-verbose way?

`gulp-lock` allows you to simply identify contentious tasks, wrap them with a lock,
and then compose them with other tasks as you normally would.


```javascript
var lock = require('gulp-lock');

var diskLock = lock(2);    // create a lock with a concurrency limit of 2
var networkLock = lock();  // create a lock with default concurrency limit (1).

gulp.task('disk-task1', ['dependency'], diskLock.stream(function() {
  return gulp.src(/*...*/)
             .pipe(/*...*/)
  // ...
});

// disk-task2 ... disk-taskN - only two will run at once.

gulp.task('net-task1', ['dependency'], networkLock.cb(function(cb) {
  // ...
});
```

A lock object provides three different wrapper methods for your task.

1. `lock.cb(taskFunc)` wraps a task method that takes a completion callback.
    Once the concurrency limit is reached, tasks will queue until a task
    releases it's hold on the lock by calling the callback.
2. `lock.stream(taskFunc)` wraps a task method that returns a stream.
    (i.e. `return gulp.src(...)`). A task releases its hold on a lock
    when the returned stream ends.
3. `lock.promise(taskFunc)` wraps a task that returns a promise. Tasks
    release their hold on the lock when the promise is resolved.

These are the three forms of asynchronous tasks allowed by gulps orchestrator,
so you should be able to wrap any async task with minimal effort. Gulp
does allow a fourth task type, the synchronous type. Since javascript is single
threaded synchronous tasks already enforce a lock with a concurrency of 1,
so there would be no point in providing a wrapper.

Tasks are queued for execution for by gulps orchestrator. Whichever task
has it's dependencies met first will be queued first. This is an attempt to
maximize concurrency (within the limits set by the lock).

###unlimited
The "unlimited" lock provides a convenient way to disable the effects of
`gulp-lock`. It provides an identical api to the normal locks, but all wrapper
functions are actually identity functions that just return the function without
wrapping it. A potential usage would be to only enforce concurrency restrictions
on Travis. Travis vms often suffer from slower network/disk access than developer
machines, and you are probably willing to trade reduced concurrency (i.e. speed)
for added dependability on your travis build.

```javascript
var lock = require('gulp-lock');

// only restrict concurrency on travis
var myLock = process.env.TRAVIS ? lock(1) : lock.unlimited;

// lock will have no affect outside of travis
gulp.task('myTask', myLock.stream(function(){/*...*/});
```

###not really a gulp plugin

While this is listed as a gulp plugin, it actually has no dependency on gulp
or any vinyl libraries. It can be used to control concurrency for any async
functions that either:

1. take a callback as their first arg.
2. return a promise.
3. return a stream.
