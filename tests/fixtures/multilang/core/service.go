package core

import (
	"fmt"
	"time"
)

type WorkerPool struct {
	WorkerCount int
	Running     bool
}

func NewWorkerPool(workers int) *WorkerPool {
	return &WorkerPool{
		WorkerCount: workers,
		Running:     false,
	}
}

func (wp *WorkerPool) Start() error {
	wp.Running = true
	fmt.Printf("Worker pool started at %v\n", time.Now())
	return nil
}
