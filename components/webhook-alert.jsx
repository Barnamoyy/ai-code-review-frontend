import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { addRepository } from "@/api/repository";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

const WebhookAlert = ({ open, setOpen, repo }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { data: session } = useSession();
  const username = session?.username;
  const token = session?.accessToken;

  const handleAddRepository = async (repo) => {
    const repoName = repo?.full_name;
    try {
      const response = await addRepository(repoName, username);
      console.log(response.data);
    } catch (error) {
      console.error("Error adding repository:", error);
    }
  };

  const handleAddWebhook = async ({ token, repo }) => {
    const owner = repo?.owner?.login;
    const repoName = repo?.name;

    try {
      const response = await addWebhook(token, owner, repoName);
      console.log(response.data);
    } catch (error) {
      console.error("Error adding webhook:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Add our webhook to your github repository for the code review
            feature to work.
            <div className="rounded-md border px-4 py-2 mt-4 font-mono text-sm">
              http://localhost:8080/webhook/github
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleAddRepository(repo);
              handleAddWebhook(token, username, repo);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WebhookAlert;
