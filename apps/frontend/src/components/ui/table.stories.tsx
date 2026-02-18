import type { Meta, StoryObj } from "@storybook/react/dist/index";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

/**
 * 🍍 JOLANANAS - Table
 * ====================
 * Composant de tableau pour afficher des données structurées.
 */
const meta: Meta<typeof Table> = {
  title: "JOLANANAS/UI/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Payé",
    totalAmount: "€250.00",
    paymentMethod: "Carte Bleue",
  },
  {
    invoice: "INV002",
    paymentStatus: "En attente",
    totalAmount: "€150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Non payé",
    totalAmount: "€350.00",
    paymentMethod: "Virement",
  },
];

export const Default: Story = {
  render: () => (
    <div className="w-[600px] border rounded-md p-4 bg-white">
      <Table>
        <TableCaption>Une liste de vos factures récentes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Facture</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Méthode</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">€750.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
};
