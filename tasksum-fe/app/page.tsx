"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Define types
interface Todo {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to fetch todos. Please try again.");
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        fetchTodos();
        toast.success("Task added successfully");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/${id}`, {
        method: "DELETE",
      });
      fetchTodos();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const summarizeTodos = async () => {
    setIsSummarizing(true);
    setSummary("");
    setShowSummary(false);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/summarize`, {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSummary(data.summary || data.message);
        setShowSummary(true);
        toast.success("Summary has been sent to Slack");
      }
    } catch (error) {
      console.error("Error summarizing todos:", error);
      toast.error("Failed to summarize tasks. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Todo Summary Assistant
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your tasks and get AI-powered summaries
            </p>
          </div>

          {/* Add Todo Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
              <CardDescription>Create a new task with title and description</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addTodo} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about your task"
                    rows={3}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Task
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Todo List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>Manage and organize your tasks</CardDescription>
              </div>
              <Button
                onClick={summarizeTodos}
                disabled={isSummarizing || todos.length === 0}
                variant="default"
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Summarize & Send to Slack
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {todos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks yet. Add one to get started!
                </div>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo, index) => (
                    <div key={todo.id}>
                      {index > 0 && <Separator className="my-2" />}
                      <div className="flex justify-between items-start py-2">
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {todo.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(todo.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => deleteTodo(todo.id)}
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Display */}
          {showSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>AI-generated summary of your tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-md">
                  <p className="whitespace-pre-line">
                    {summary}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  Sent to Slack
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
